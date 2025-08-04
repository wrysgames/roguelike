import { PlayerSaveData } from '../types/schemas/inventory';

export const profileTemplate: PlayerSaveData = {
	equipped: {},
	gold: 0,
	inventory: [
		{
			id: 'weapon:wooden_sword',
		},
	],
};
