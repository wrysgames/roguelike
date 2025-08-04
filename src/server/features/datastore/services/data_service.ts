import { OnStart, Service } from '@flamework/core';
import { Players } from '@rbxts/services';
import { PlayerService } from 'server/features/player/services/player_service';
import { PlayerSaveData } from '../types/schemas/inventory';
import ProfileStore, { ProfileStoreProfile } from '../utils/profile_store';

const PROFILE_TEMPLATE: PlayerSaveData = {
	equipped: {},
	gold: 0,
	inventory: [],
};

const PLAYER_STORE = new ProfileStore<PlayerSaveData>('test', PROFILE_TEMPLATE);

@Service()
export class DataService implements OnStart {
	private profiles: Map<Player, ProfileStoreProfile<PlayerSaveData>> = new Map();

	constructor(private playerService: PlayerService) {}

	public onStart(): void {
		this.playerService.addPlayerAddedCallback((player) => {
			this.loadProfile(player);
		});
	}

	public loadProfile(player: Player): void {
		const profile = PLAYER_STORE.StartSessionAsync(tostring(player.UserId), {
			Cancel: () => player.Parent !== Players,
		});
		print(profile);

		if (!profile) return player.Kick('Failed to load your data');

		profile.Reconcile();
		profile.AddUserId(player.UserId);
		profile.OnSessionEnd.Connect(() => {
			player.Kick(`Profile session ended - please rejoin`);
		});

		if (player.Parent === Players) {
			this.profiles.set(player, profile);
			print(`Profile loaded for ${player.DisplayName}!`);
		} else {
			profile.EndSession();
		}
	}
}
