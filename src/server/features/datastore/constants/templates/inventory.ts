import { InventoryData } from '../../types/schemas/inventory';
import { normalizeStoredItemData } from '../../utils/normalize';

export const inventoryProfileTemplate: InventoryData = {
	equipped: {
		weapon: normalizeStoredItemData({ instanceId: '1', type: 'weapon', id: 'weapon:wooden_sword' }),
	},
	gold: 0,
	inventory: [normalizeStoredItemData({ instanceId: '1', type: 'weapon', id: 'weapon:wooden_sword' })],
};
