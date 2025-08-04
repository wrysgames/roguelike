import { OnStart, Service } from '@flamework/core';
import { Players } from '@rbxts/services';
import Signal from '@rbxts/signal';
import { PlayerService } from 'server/features/player/services/player_service';
import { profileTemplate } from '../constants/player_data_template';
import { PlayerSaveData } from '../types/schemas/inventory';
import ProfileStore from '../utils/profile_store';
import type { ProfileStoreProfile } from '../utils/profile_store/types';

const PLAYER_STORE = new ProfileStore<PlayerSaveData>('test', profileTemplate);

@Service()
export class DataService implements OnStart {
	// Signals
	public onPlayerDataLoaded: Signal<(player: Player, data: PlayerSaveData) => void> = new Signal();
	private profiles: Map<Player, ProfileStoreProfile<PlayerSaveData>> = new Map();

	constructor(private playerService: PlayerService) {}

	public onStart(): void {
		this.playerService.addPlayerAddedCallback((player) => {
			this.loadProfile(player);
		});
		this.playerService.addPlayerLeavingCallback((player) => {
			this.unloadProfile(player);
		});
	}

	public loadProfile(player: Player): void {
		// Only load 1 profile
		if (this.profiles.has(player)) return;

		const profile = PLAYER_STORE.StartSessionAsync(tostring(player.UserId), {
			Cancel: () => player.Parent !== Players,
		});

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

	public unloadProfile(player: Player): void {
		const profile = this.profiles.get(player);
		if (profile) {
			profile.EndSession();
		}
	}
}
