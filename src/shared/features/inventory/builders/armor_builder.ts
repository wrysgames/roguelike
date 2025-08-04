import { Weapon } from 'shared/features/inventory/types';
import { ItemBuilder } from './item_builder';

export class WeaponBuilder extends ItemBuilder<Weapon> {
	constructor(id: string, name: string) {
		super(id, name, 'weapon');
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
}
