import { ItemType } from '../types';

export function getItemType(id: string): ItemType | undefined {
	if (id.sub(1, 7) === 'weapon:') return 'weapon';
	if (id.sub(1, 6) === 'armor:') return 'armor';
	return undefined;
}
