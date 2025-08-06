import { OnStart, Service } from '@flamework/core';
import { CharacterService } from 'server/features/player/services/character_service';
import { PlayerService } from 'server/features/player/services/player_service';
import { ServerEvents } from 'server/signals/networking/events';
import { AttackAnimation } from 'shared/types/animation';
import { isCharacterModel } from 'shared/utils/character';
import { AttackState } from '../utils/attack';
import { DashService } from './dash_service';
import { ItemService } from './item_service';

@Service()
export class CombatService implements OnStart {
	private attackStates: Map<Player, AttackState> = new Map();

	constructor(
		private playerService: PlayerService,
		private dashService: DashService,
		private characterService: CharacterService,
		private itemService: ItemService,
	) {}

	public onStart(): void {
		ServerEvents.combat.attack.connect((player) => this.performAttack(player));
		this.playerService.addPlayerAddedCallback((player) => this.getAttackState(player));
	}

	public performAttack(player: Player): void {
		const state = this.getAttackState(player);
		const dashState = this.dashService.getDashState(player);

		if (dashState.isDashCooldownActive) return;
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

		this.playAttackAnimation(player, attackAnimation);
	}

	private playAttackAnimation(player: Player, animation: AttackAnimation): void {
		const character = player.Character;
		if (!character) return;
		if (!isCharacterModel(character)) return;

		const state = this.getAttackState(player);

		state.currentAttackAnimation = animation;

		const track = this.characterService.loadAnimation(character, animation.animationId);

		state.isAttacking = true;
		state.isComboQueued = true;
		state.isComboWindowOpen = false;

		track.Play(undefined, undefined, 2);
		track.Ended.Once(() => track.Destroy());
	}

	private getAttackState(player: Player): AttackState {
		const state = this.attackStates.get(player);
		if (!state) {
			const newAttackState = new AttackState();
			this.attackStates.set(player, newAttackState);
			return newAttackState;
		}
		return state;
	}
}
