import Signal from '@rbxts/signal';
import { PlayerSaveData, StoredItemData } from 'server/features/datastore/types/schemas/inventory';

export class PlayerSignals {
	// Player events
	public static onPlayerDataLoaded: Signal<(player: Player, data: PlayerSaveData) => void> = new Signal();
	public static onPlayerDashed: Signal<(player: Player) => void> = new Signal();

	// Item events
	public static onItemEquipped: Signal<(player: Player, item: StoredItemData) => void> = new Signal();
	public static onItemUnequipped: Signal<(player: Player, slot: string) => void> = new Signal();

	private constructor() {}
}
