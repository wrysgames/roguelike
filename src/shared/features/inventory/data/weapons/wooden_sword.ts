import { WeaponBuilder } from '../../builders/weapon_builder';
import { Weapon } from '../../types/weapon';

const woodenSword = new WeaponBuilder('wooden_sword', 'Wooden Sword')
	.withStats({
		damage: 10,
		critRate: 0.05,
		knockback: 2.0,
	})
	.withTags('Slashing')
	.withVisualType('sword')
	.withWeaponType('medium')
	.build();

export = woodenSword;
