import { PlayerSaveData } from '../types/schemas/inventory';

export const profileTemplate: PlayerSaveData = {
	equipped: {
		weapon: {
			id: 'weapon:wooden_sword',
		},
	},
	gold: 0,
	inventory: [
		{
			id: 'weapon:wooden_sword',
		},
	],
};
