import { StoredItemData } from '../types/schemas/inventory';

export function normalizeStoredItemData(item: Partial<StoredItemData>): Required<StoredItemData> {
	return {
		instanceId: item.instanceId ?? '1',
		type: item.type ?? 'weapon',
		id: item.id ?? '-1',
		level: item.level ?? 1,
		xp: item.xp ?? 0,
		tier: item.tier ?? 0,
	};
}
