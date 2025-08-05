import { OnStart, Service } from '@flamework/core';
import { PlayerService } from 'server/features/player/services/player_service';
import { ServerEvents } from 'server/signals/networking/events';
import { PlayerSignals } from 'server/signals/player_signal';
import { isR15CharacterModel, validateR15CharacterModel } from 'shared/utils/character';
import { DashState } from '../utils/dash';

// const DASH_COOLDOWN = 0.75;

@Service()
export class DashService implements OnStart {
	private dashStates: Map<Player, DashState> = new Map();

	constructor(private playerService: PlayerService) {}

	public onStart(): void {
		ServerEvents.combat.dash.connect((player) => {
			this.performDash(player);
		});

		this.playerService.addPlayerAddedCallback((player) => this.getDashState(player));

		// invalidate the player's dash state when they leave
		this.playerService.addPlayerLeavingCallback((player) => this.dashStates.delete(player));
	}

	public performDash(player: Player): void {
		const state = this.getDashState(player);
		if (state.isDashing || state.isDashCooldownActive) return;

		const character = player.Character;
		if (!character) return;

		if (!isR15CharacterModel(character)) return;

		print('Dash performed');
		PlayerSignals.onPlayerDashed.Fire(player);
	}

	public getDashState(player: Player): DashState {
		const state = this.dashStates.get(player);
		if (!state) {
			const newDashState = new DashState();
			this.dashStates.set(player, newDashState);
			return newDashState;
		}
		return state;
	}
}
