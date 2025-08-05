import Signal from '@rbxts/signal';
import { PlayerSaveData } from 'server/features/datastore/types/schemas/inventory';

export class PlayerSignals {
	public static onPlayerDataLoaded: Signal<(player: Player, data: PlayerSaveData) => void> = new Signal();
	public static onItemEquipped: Signal<(player: Player, instanceId: string) => void> = new Signal();
	public static onItemUnequipped: Signal<(player: Player, slot: string) => void> = new Signal();
	public static onPlayerDashed: Signal<(player: Player) => void> = new Signal();
	private constructor() {}
}
