import { OnStart, Service } from '@flamework/core';
import { CharacterService } from 'server/features/player/services/character_service';
import { PlayerService } from 'server/features/player/services/player_service';
import { CollisionService } from 'server/shared/services/collision_service';
import { ServerEvents } from 'server/signals/networking/events';
import { PlayerSignals } from 'server/signals/player_signal';
import { CollisionGroup } from 'shared/constants/collision_group';
import { isR15CharacterModel } from 'shared/utils/character';
import { DashState } from '../utils/dash';

// const DASH_COOLDOWN = 0.75;

@Service()
export class DashService implements OnStart {
	private dashStates: Map<Player, DashState> = new Map();

	constructor(
		private playerService: PlayerService,
		private collisionService: CollisionService,
		private characterService: CharacterService,
	) {}

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

		const humanoid = character.Humanoid;

		// set the character's collision group to Invincible
		this.collisionService.setModelCollisionGroup(character, CollisionGroup.Invincible);
		this.characterService.enableJump(character);

		const previousAutoRotate = humanoid.AutoRotate;
		humanoid.AutoRotate = false;

		state.isDashing = true;
		state.isDashCooldownActive = true;

		humanoid.AutoRotate = previousAutoRotate;

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
