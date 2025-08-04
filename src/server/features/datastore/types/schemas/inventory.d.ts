export interface StoredItemData {
	id: string; // item ID
	level?: number;
}

export interface PlayerSaveData {
	gold: number;
	inventory: StoredItemData[];
	equipped: {
		weapon?: StoredItemData;
		armor?: StoredItemData;
	};
}
