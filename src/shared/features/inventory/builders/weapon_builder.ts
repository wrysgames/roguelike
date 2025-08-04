import { Weapon } from 'shared/features/inventory/types';
import { ItemBuilder } from './item_builder';

export class WeaponBuilder extends ItemBuilder<Weapon> {
	constructor(id: string, name: string) {
		super(id, name, 'weapon');
		this.item.tags = [];
		this.item.upgrades = [];
	}

	withWeaponType(weaponType: Weapon['weaponType']): this {
		this.item.weaponType = weaponType;
		return this;
	}

	withVisualType(visualType: Weapon['visualType']): this {
		this.item.visualType = visualType;
		return this;
	}

	withModel(model: Weapon['model']): this {
		this.item.model = model;
		return this;
	}

	override validate(): asserts this is { item: Weapon } {
		super.validate();
		if (!this.item.weaponType) {
			throw `Missing visualType property`;
		}
		if (!this.item.visualType) {
			throw `Missing visualType property`;
		}
	}
}
