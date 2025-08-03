import { BaseItem, BaseUpgrade } from './item';
import { Elemental } from './elemental';

export type ArmorSlot = 'helmet' | 'chestplate' | 'boots';

export type ArmorTag = 'KnockbackResist' | 'FireResist' | 'IceResist' | 'Thorns' | 'SpeedBoost' | 'Tanky' | 'Agile';

export interface ArmorStats {
	defense: number;
	healthBonus?: number;
	moveSpeed?: number;
	statusResist?: Partial<Record<Elemental, number>>;
}

export type ArmorUpgrade = BaseUpgrade<ArmorStats>;

export type ArmorModel = Model;

export interface Armor extends BaseItem<ArmorStats, ArmorTag> {
	type: 'armor';
	armorSlot: ArmorSlot;
	model?: ArmorModel;
}
