import { OnStart, Service } from '@flamework/core';
import { RunService } from '@rbxts/services';
import { CharacterService } from 'server/features/player/services/character_service';
import { PlayerService } from 'server/features/player/services/player_service';
import { ServerEvents } from 'server/signals/networking/events';
import { AttackAnimation } from 'shared/types/animation';
import { isCharacterModel } from 'shared/utils/character';
import { AttackState } from '../utils/attack';
import { SharedStateManager } from '../utils/shared_state_manager';
import { DashService } from './dash_service';
import { ItemService } from './item_service';

const COMBO_COOLDOWN = 0.5;

const DEFAULT_HITBOX_START_KEYFRAME_NAME = 'Hit';
const DEFAULT_COMBO_START_KEYFRAME_NAME = 'Combo';
const DEFAULT_COMBO_END_KEYFRAME_NAME = 'ComboEnd';

@Service()
export class CombatService implements OnStart {
	constructor(
		private characterService: CharacterService,
		private itemService: ItemService,
	) {}

	public onStart(): void {
		ServerEvents.combat.attack.connect((player) => this.performAttack(player));
	}

	public performAttack(player: Player): void {
		const state = this.getAttackState(player);
		const dashState = SharedStateManager.getInstance().getDashState(player);

		if (dashState.isDashing) return;
		if (state.isComboCooldownActive) return;

		if (state.comboResetTask) {
			task.cancel(state.comboResetTask);
			state.comboResetTask = undefined;
		}

		if (state.isAttacking) {
			if (state.isComboWindowOpen) {
				state.isComboQueued = true;
			}
			return;
		}

		const equippedWeapon = this.itemService.getEquippedWeapon(player);
		if (!equippedWeapon) return;
		const attackAnimationSet = this.itemService.getWeaponAttackAnimationSet(equippedWeapon);
		const attackAnimation = attackAnimationSet[state.comboIndex++];
		if (!attackAnimation) return;

		// If the animation was the last in the list, the combo is finished; add a cooldown
		if (state.comboIndex >= attackAnimationSet.size()) {
			state.isComboCooldownActive = true;
			task.delay(COMBO_COOLDOWN, () => (state.isComboCooldownActive = false));
			this.resetCombo(player);
		} else {
			state.comboResetTask = task.delay(1, () => {
				if (!state.isAttacking) {
					this.resetCombo(player);
				}
			});
		}

		this.playAttackAnimation(player, attackAnimation);
	}

	private playAttackAnimation(player: Player, animation: AttackAnimation): void {
		const character = player.Character;
		if (!character) return;
		if (!isCharacterModel(character)) return;

		const equippedWeapon = this.itemService.getEquippedWeapon(player);
		if (!equippedWeapon) return;

		const state = this.getAttackState(player);

		state.currentAttackAnimation = animation;

		const track = this.characterService.loadAnimation(character, animation.animationId);

		state.isAttacking = true;
		state.isComboQueued = false;
		state.isComboWindowOpen = false;

		track.Play();
		track
			.GetMarkerReachedSignal(animation.keyframes?.hitbox?.start ?? DEFAULT_HITBOX_START_KEYFRAME_NAME)
			.Once(() => {
				this.enableHitbox(player);
				// TODO: Play slashing sound
				// TODO: Slash VFX
			});
		track
			.GetMarkerReachedSignal(animation.keyframes?.combo?.start ?? DEFAULT_COMBO_START_KEYFRAME_NAME)
			.Once(() => {
				state.isComboWindowOpen = true;
			});
		if (animation.keyframes?.combo?.end) {
			track.GetMarkerReachedSignal(animation.keyframes.combo.end ?? DEFAULT_COMBO_END_KEYFRAME_NAME).Once(() => {
				state.isComboWindowOpen = false;
			});
		}
		track.Stopped.Once(() => {
			state.isAttacking = false;
			state.currentAttackAnimation = undefined;
			this.disableHitbox(player);
			track.Destroy();

			if (state.isComboQueued) {
				this.performAttack(player);
			}
		});
	}

	private enableHitbox(player: Player): void {
		const state = this.getAttackState(player);
		if (state.isHitboxActive) return;
		if (state.hitboxConnection) return;

		state.hitboxConnection = RunService.Heartbeat.Connect(() => {
			if (!state.currentAttackAnimation) return this.disableHitbox(player);
		});
	}

	private disableHitbox(player: Player) {
		const state = this.getAttackState(player);
		if (!state.isHitboxActive) return;
		if (state.hitboxConnection) state.hitboxConnection.Disconnect();
		state.hitboxConnection = undefined;
		state.isHitboxActive = false;
	}

	private resetCombo(player: Player) {
		const state = this.getAttackState(player);
		state.comboIndex = 0;
		state.isComboWindowOpen = false;
		state.comboResetTask = undefined;
	}

	public getAttackState(player: Player): AttackState {
		return SharedStateManager.getInstance().getAttackState(player);
	}
}
