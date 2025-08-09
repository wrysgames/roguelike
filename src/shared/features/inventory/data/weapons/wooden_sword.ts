import { ReplicatedStorage } from '@rbxts/services';
import { WeaponBuilder } from '../../builders/weapon_builder';

const woodenSword = new WeaponBuilder('wooden_sword', 'Wooden Sword', 'common')
	.withStats({
		damage: 10,
		critRate: 0.05,
		knockback: 2.0,
	})
	.withTags('Slashing')
	.withVisualType('sword')
	.withWeaponType('medium')
	.obtainableInDrop()
	.withUpgrade({
		stats: { damage: 9, critRate: 0.5 },
		description: '+5 base damage',
	})
	.withUpgrade({
		stats: { critRate: 0.1, damage: 8 },
		description: '+10% base damage',
	})
	.withModel(ReplicatedStorage.weapons.FindFirstChild(script.Name))
	.build();

export = woodenSword;
