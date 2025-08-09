import { OnStart, Service } from '@flamework/core';
import ObjectUtils, { deepCopy } from '@rbxts/object-utils';
import ProfileStore, { Profile } from '@rbxts/profile-store';
import { HttpService, Players } from '@rbxts/services';
import { PlayerService } from 'server/features/player/services/player_service';
import { PlayerSignals } from 'server/signals/player_signal';
import { ItemType } from 'shared/features/inventory/types';
import { inventoryProfileTemplate } from '../constants/templates/inventory';
import { InventoryData, StoredItemData } from '../types/schemas/inventory';
import { normalizeStoredItemData } from '../utils/normalize';

const INVENTORY_DATA_STORE = ProfileStore.New<InventoryData>('INVENTORY', inventoryProfileTemplate);

@Service()
export class InventoryDataService implements OnStart {
	private profiles: Map<Player, Profile<InventoryData>> = new Map();

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

		const profile = INVENTORY_DATA_STORE.StartSessionAsync(tostring(player.UserId), {
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
			PlayerSignals.onPlayerInventoryDataLoaded.Fire(player, profile.Data);
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

	public equipItem(player: Player, instanceId: string): StoredItemData | undefined {
		const inventory = this.getInventory(player);
		if (inventory) {
			// check if the instance is in the inventory
			const instance = this.getInstanceFromPlayerInventory(player, instanceId);
			if (!instance) return undefined;
			const profile = this.profiles.get(player);
			if (!profile) return undefined;
			const previous = profile.Data.equipped[instance.type];
			if (previous) this.unequipItem(player, instance.type);

			profile.Data.equipped[instance.type] = instance;
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
	}

	public getEquippedItem(player: Player, slot: ItemType): StoredItemData | undefined {
		const profile = this.profiles.get(player);
		if (!profile) return undefined;
		const item = profile.Data.equipped[slot];
		if (!item) return undefined;
		return deepCopy(item);
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

	private normalizePlayerData(data: InventoryData): void {
		ObjectUtils.keys(data.equipped).forEach((key) => {
			const item = data.equipped[key];
			if (!item) return;
			data.equipped[key] = normalizeStoredItemData(item);
		});

		data.inventory = data.inventory.map(normalizeStoredItemData);
	}
}
