import { StoredItemData } from '../types/schemas/inventory';

export function normalizeStoredItemData(item: StoredItemData): Required<StoredItemData> {
	return {
		instanceId: item.instanceId ?? '1',
		type: item.type ?? 'weapon',
		id: item.id,
		level: item.level ?? 1,
		xp: item.xp ?? 0,
		tier: item.tier ?? 0,
	};
}
