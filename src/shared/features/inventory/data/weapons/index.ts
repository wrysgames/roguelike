import { getDescendantsOfType } from 'shared/utils/instance';
import { Weapon } from '../../types/weapon';

// Flags
let isInitialized: boolean = false;
const weapons: Weapon[] = [];

export function getWeapons(): Weapon[] {
	if (!isInitialized) {
		const modules = getDescendantsOfType(script, 'ModuleScript');
		for (const module of modules) {
			// biome-ignore lint/style/noCommonJs: require is valid in this context
			const weapon = require(module) as Weapon;
			weapons.push(weapon);
		}
		isInitialized = true;
	}
	return weapons;
}
