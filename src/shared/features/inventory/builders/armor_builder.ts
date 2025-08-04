import { Armor } from 'shared/features/inventory/types';
import { ItemBuilder } from './item_builder';

export class ArmorBuilder extends ItemBuilder<Armor> {
	constructor(id: string, name: string, rarity: Armor['rarity']) {
		super(id, name, 'armor', rarity);
	}

	withModel(model: Armor['model']): this {
		this.item.model = model;
		return this;
	}

	withArmorSlot(slot: Armor['armorSlot']): this {
		this.item.armorSlot = slot;
		return this;
	}

	override validate(): asserts this is { item: Armor } {
		super.validate();

		if (!this.item.armorSlot) {
			throw `Missing armorSlot property`;
		}
	}
}
