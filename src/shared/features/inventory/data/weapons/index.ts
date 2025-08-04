import { getDescendantsOfType } from 'shared/utils/instance';
import { Weapon } from '../../types/weapon';

// Flags
let isInitialized: boolean = false;
const weapons: Readonly<Weapon>[] = [];

export function getWeapons(): ReadonlyArray<Readonly<Weapon>> {
	if (!isInitialized) {
		const modules = getDescendantsOfType(script, 'ModuleScript');
		for (const module of modules) {
			try {
				// biome-ignore lint/style/noCommonJs: require is valid in this context
				const weapon = require(module) as Readonly<Weapon>;
				weapons.push(weapon);
			} catch (e) {
				print(`Module ${module.Name} could not be built: ${tostring(e)}`);
			}
		}
		isInitialized = true;
	}
	return weapons;
}
