import { OnStart, Service } from '@flamework/core';
import ObjectUtils, { deepCopy } from '@rbxts/object-utils';
import ProfileStore, { Profile } from '@rbxts/profile-store';
import { Players } from '@rbxts/services';
import { PlayerService } from 'server/features/player/services/player_service';
import { statsProfileTemplate } from '../constants/templates/stats';
import { StatsData } from '../types/schemas/stats';

const STATS_DATA_SERVICE = ProfileStore.New<StatsData>('STATS', statsProfileTemplate);

@Service()
export class InventoryDataService implements OnStart {
	private profiles: Map<Player, Profile<StatsData>> = new Map();

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

		const profile = STATS_DATA_SERVICE.StartSessionAsync(tostring(player.UserId), {
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

	public incrementPlayerStat(player: Player, value: keyof StatsData, amount: number = 1): void {
		const profile = this.profiles.get(player);
		if (!profile) return;

		if (typeIs(profile.Data[value], 'number')) {
			profile.Data[value] += amount;
		}
	}

	public getPlayerStats(player: Player): Readonly<StatsData> | undefined {
		const profile = this.profiles.get(player);
		if (!profile) return undefined;
		return deepCopy(profile.Data);
	}
}
