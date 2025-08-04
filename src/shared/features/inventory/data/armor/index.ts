import { getDescendantsOfType } from 'shared/utils/instance';
import { Armor } from '../../types';

// Flags
let isInitialized: boolean = false;
const armors: Readonly<Armor>[] = [];

export function getArmor(): ReadonlyArray<Readonly<Armor>> {
	if (!isInitialized) {
		const modules = getDescendantsOfType(script, 'ModuleScript');
		for (const module of modules) {
			try {
				// biome-ignore lint/style/noCommonJs: require is valid in this context
				const armor = require(module) as Readonly<Armor>;
				armors.push(armor);
			} catch (e) {
				print(`Module ${module.Name} could not be built: ${tostring(e)}`);
			}
		}
		isInitialized = true;
	}
	return armors;
}
