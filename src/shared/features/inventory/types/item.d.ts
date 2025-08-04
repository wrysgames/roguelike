export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

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

export interface Inventory {
    items: Item[];
    equipped: EquipmentSlots;
}

export interface BaseUpgrade<TStats extends defined> {
    stats: Partial<TStats>;
    description?: string;
}

export interface BaseItem<TStats extends defined, TTag extends defined> {
    id: string;
    name: string;
    tags: TTag[];
    baseStats: TStats;
    upgrades?: BaseUpgrade<TStats>;
    obtainable?: {
        chests?: boolean;
        drops?: boolean;
    };
}
