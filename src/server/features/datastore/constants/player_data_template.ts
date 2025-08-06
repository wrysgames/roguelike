import { PlayerSaveData } from '../types/schemas/inventory';
import { normalizeStoredItemData } from '../utils/normalize';

export const profileTemplate: PlayerSaveData = {
	equipped: {
		weapon: normalizeStoredItemData({ instanceId: '1', type: 'weapon', id: 'weapon:wooden_sword' }),
	},
	gold: 0,
	inventory: [normalizeStoredItemData({ instanceId: '1', type: 'weapon', id: 'weapon:wooden_sword' })],
};
