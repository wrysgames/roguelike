import { OnStart, Service } from '@flamework/core';
import { deepCopy } from '@rbxts/object-utils';
import { HttpService, Players } from '@rbxts/services';
import { PlayerService } from 'server/features/player/services/player_service';
import { PlayerSignals } from 'server/signals/player_signal';
import { ItemType } from 'shared/features/inventory/types';
import { profileTemplate } from '../constants/player_data_template';
import { PlayerSaveData, StoredItemData } from '../types/schemas/inventory';
import { normalizeStoredItemData } from '../utils/normalize';
import ProfileStore from '../utils/profile_store';
import type { ProfileStoreProfile } from '../utils/profile_store/types';

const PLAYER_STORE = new ProfileStore<PlayerSaveData>('test', profileTemplate);

@Service()
export class DataService implements OnStart {
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

			// Normalize the data before doing anything
			this.normalizePlayerData(profile.Data);

			// Fire data loaded events
			PlayerSignals.onPlayerDataLoaded.Fire(player, profile.Data);
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

	public equipItem(player: Player, instanceId: string, slot: ItemType): StoredItemData | undefined {
		const inventory = this.getInventory(player);
		if (inventory) {
			// check if the instance is in the inventory
			const instance = this.getInstanceFromPlayerInventory(player, instanceId);
			if (!instance) return undefined;
			const profile = this.profiles.get(player);
			if (!profile) return undefined;

			switch (slot) {
				case 'weapon':
					profile.Data.equipped.weapon = instance;
					break;
				case 'armor':
					profile.Data.equipped.armor = instance;
					break;
				default:
					return undefined;
			}

			PlayerSignals.onItemEquipped.Fire(player, instance);
			return instance;
		} else {
			warn('[DataService]: Inventory not found');
			return undefined;
		}
	}

	public unequipItem(player: Player, slot: ItemType): void {
		const profile = this.profiles.get(player);
		if (!profile) return;

		const item = profile.Data.equipped[slot];
		if (!item) return;

		profile.Data.equipped[slot] = undefined;
		PlayerSignals.onItemUnequipped.Fire(player, item.instanceId);
	}

	public equipWeapon(player: Player, instanceId: string): StoredItemData | undefined {
		return this.equipItem(player, instanceId, 'weapon');
	}

	public equipArmor(player: Player, instanceId: string): StoredItemData | undefined {
		return this.equipItem(player, instanceId, 'armor');
	}

	public getEquippedWeapon(player: Player): StoredItemData | undefined {
		const profile = this.profiles.get(player);
		if (!profile) return undefined;
		const weapon = profile.Data.equipped.weapon;
		if (!weapon) return undefined;
		return deepCopy(weapon);
	}

	public getEquippedArmor(player: Player): StoredItemData | undefined {
		const profile = this.profiles.get(player);
		if (!profile) return undefined;
		const armor = profile.Data.equipped.armor;
		if (!armor) return undefined;
		return deepCopy(armor);
	}

	public getInventory(player: Player): StoredItemData[] | undefined {
		// copy the items from the inventory
		const profile = this.profiles.get(player);
		if (!profile) return;
		if (!profile.Data) return;
		return deepCopy(profile?.Data.inventory);
	}

	public generateInstanceId(): string {
		return HttpService.GenerateGUID(false);
	}

	public getInstanceFromPlayerInventory(player: Player, instanceId: string): StoredItemData | undefined {
		const inventory = this.getInventory(player);
		if (!inventory) return undefined;
		const instance = inventory.find((item) => item.instanceId === instanceId);
		if (instance) return instance;
		return undefined;
	}

	private normalizePlayerData(data: PlayerSaveData): void {
		if (data.equipped.weapon) {
			data.equipped.weapon = normalizeStoredItemData(data.equipped.weapon);
		}
		if (data.equipped.armor) {
			data.equipped.armor = normalizeStoredItemData(data.equipped.armor);
		}
		data.inventory = data.inventory.map(normalizeStoredItemData);
	}
}
