import { OnStart, Service } from '@flamework/core';
import { PlayerService } from 'server/features/player/services/player_service';
import { ServerEvents } from 'server/signals/networking/events';
import { AttackState } from '../utils/attack';
import { DashService } from './dash_service';
import { ItemService } from './item_service';

@Service()
export class CombatService implements OnStart {
	private attackStates: Map<Player, AttackState> = new Map();

	constructor(
		private playerService: PlayerService,
		private dashService: DashService,
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
