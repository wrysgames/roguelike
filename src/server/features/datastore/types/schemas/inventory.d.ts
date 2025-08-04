export interface StoredItemData {
	instanceId: string;
	id: string; // item ID
	xp?: number;
	level?: number;
	tier?: number; // 0 = base, 1 = tier II, 3 = tier III, etc...
}

export interface PlayerSaveData {
	gold: number;
	inventory: StoredItemData[];
	equipped: {
		weapon?: StoredItemData;
		armor?: StoredItemData;
	};
}
