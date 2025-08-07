import { Weapon } from 'shared/features/inventory/types';
import { isWeaponModelValid } from '../utils/validate_weapon_model';
import { ItemBuilder } from './item_builder';

export class WeaponBuilder extends ItemBuilder<Weapon> {
	constructor(id: string, name: string, rarity: Weapon['rarity']) {
		super(id, name, 'weapon', rarity);
	}

	withWeaponType(weaponType: Weapon['weaponType']): this {
		this.item.weaponType = weaponType;
		return this;
	}

	withVisualType(visualType: Weapon['visualType']): this {
		this.item.visualType = visualType;
		return this;
	}

	withModel(model?: Instance): this {
		if (!model) return this;
		if (!isWeaponModelValid(model)) {
			warn(`[WeaponBuilder]: Item ${this.item.id} had invalid model`);
			return this;
		}
		this.item.model = model;
		return this;
	}

	override validate(): asserts this is { item: Weapon } {
		super.validate();
		if (!this.item.weaponType) {
			throw `Missing weaponType property`;
		}
		if (!this.item.visualType) {
			throw `Missing visualType property`;
		}
	}
}
