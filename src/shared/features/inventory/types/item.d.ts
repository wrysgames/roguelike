import { Rarity } from './rarity';

export interface Item {
    id: string;
    type: string;
    rarity: Rarity;
}

export interface EquipmentSlots {
    weapon: Item;
    chestplate?: Item;
    boots?: Item;
}
