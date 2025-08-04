import { StoredItemData } from '../types/schemas/inventory';

export function normalizeStoredItemData(item: StoredItemData): Required<StoredItemData> {
	return {
		instanceId: item.instanceId,
		id: item.id,
		level: item.level ?? 1,
		xp: item.xp ?? 0,
		tier: item.tier ?? 0,
	};
}
