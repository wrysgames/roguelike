import { BaseItem, BaseUpgrade } from './item';

export type WeaponArchetype = 'light' | 'medium' | 'heavy';
export type WeaponVisualType = 'scythe' | 'sword' | 'axe' | 'dagger';

export type WeaponTag =
	| 'Slashing'
	| 'Pierching'
	| 'Blunt'
	| 'Multihit'
	| 'Cleaving'
	| 'HeavyImpact'
	| 'BackstabCrit'
	| 'ComboChain';

export interface WeaponStats {
	damage: number;
	critRate: number; // 0.0–1.0
	knockback: number;
	attackSpeed?: number; // hits/sec or time between swings
}

export type WeaponUpgrade = BaseUpgrade<WeaponStats>;

export interface WeaponModel extends Model {
	Handle: BasePart & {
		Hitboxes: Folder;
		RightGripAttachment: Attachment;
	};
	TipAttachment: ObjectValue;
}

export interface Weapon extends BaseItem<WeaponStats, WeaponTag> {
	type: 'weapon';
	weaponType: WeaponArchetype;
	visualType: WeaponVisualType;
	model?: WeaponModel;
}
