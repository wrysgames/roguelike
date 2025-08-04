import { ArmorBuilder } from '../../builders/armor_builder';

const woodenArmor = new ArmorBuilder('wooden_armor', 'Wooden Armor', 'common')
	.withStats({
		defense: 10,
		healthBonus: 25,
		statusResist: {
			ice: 0.05,
		},
	})
	.obtainableInDrop()
	.withArmorSlot('chestplate')
	.withUpgrade({
		stats: {
			defense: 15,
			healthBonus: 20,
			statusResist: {
				ice: 0.05,
			},
		},
		description: '+5% ice resistance',
	})
	.withUpgrade({
		stats: { healthBonus: 10 },
		description: '+10% base damage',
	})
	.build();

export = woodenArmor;
