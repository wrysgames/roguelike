import Signal from '@rbxts/signal';
import { InventoryData, StoredItemData } from 'server/features/datastore/types/schemas/inventory';
import { ItemType } from 'shared/features/inventory/types';

export class PlayerSignals {
	// Player events
	public static onPlayerInventoryDataLoaded: Signal<(player: Player, data: InventoryData) => void> = new Signal();
	public static onPlayerDashed: Signal<(player: Player) => void> = new Signal();

	// Item events
	public static onItemEquipped: Signal<(player: Player, item: StoredItemData) => void> = new Signal();
	public static onItemUnequipped: Signal<(player: Player, slot: ItemType) => void> = new Signal();

	private constructor() {}
}
