import { OnStart, Service } from '@flamework/core';
import ObjectUtils from '@rbxts/object-utils';
import { DataService } from 'server/features/datastore/services/data_service';
import { StoredItemData } from 'server/features/datastore/types/schemas/inventory';
import { CharacterService } from 'server/features/player/services/character_service';
import { ServerEvents } from 'server/signals/networking/events';
import { SWORD_ATTACK_ANIMATION_SET } from 'shared/constants/animations/attack_animation_sets/sword';
import { getArmorById } from 'shared/features/inventory/data/armor';
import { getWeaponById } from 'shared/features/inventory/data/weapons';
import { Armor, BaseItem, InferStats, InferTags, Weapon } from 'shared/features/inventory/types';
import { AttackAnimation } from 'shared/types/animation';
import { isCharacterModel, isR15CharacterModel } from 'shared/utils/character';
import { deepClone } from 'shared/utils/instance';

@Service()
export class ItemService implements OnStart {
	constructor(
		private dataService: DataService,
		private characterService: CharacterService,
	) {}

	public onStart(): void {
		ServerEvents.combat.equip.connect((player, instanceId) => {
			const item = this.dataService.getInstanceFromPlayerInventory(player, instanceId);
			if (!item) return;
			print(`Equipping ${item.id} to slot: ${item.type} for player ${player.DisplayName}`);
			this.equipItem(player, instanceId);
		});
	}

	public equipItem(player: Player, instanceId: string): void {
		const character = player.Character;
		if (!character) return;
		if (!isCharacterModel(character)) return;

		const item = this.dataService.equipItem(player, instanceId);
		if (!item) return;

		// Visually attach it to the player's character
		switch (item.type) {
			case 'weapon': {
				if (!isR15CharacterModel(character)) return;
				const weapon = getWeaponById(item.id);
				if (!weapon) return;

				const model = weapon.model;
				if (!model) break;

				// weld the model to the player's hand
				this.characterService.mountPartToRightHand(character, model.Handle);
				break;
			}
			case 'armor':
				break;
			default:
				return;
		}
	}

	public getEquippedWeapon(player: Player): Readonly<Weapon> | undefined {
		const weapon = this.dataService.getEquippedItem(player, 'weapon')?.id;
		if (weapon) {
			return getWeaponById(weapon);
		}
		return undefined;
	}

	public getEquippedArmor(player: Player): Readonly<Armor> | undefined {
		const armorId = this.dataService.getEquippedItem(player, 'armor')?.id;
		if (armorId) {
			return getArmorById(armorId);
		}
		return undefined;
	}

	public calculateItemStats<T extends BaseItem<InferStats<T>, InferTags<T>>>(
		item: T,
		tier: number,
		level: number,
	): InferStats<T> {
		let scaledStats: InferStats<T> = deepClone(item.baseStats);

		if (item.upgrades) {
			for (let i = 0; i < math.min(tier, item.maxTiers, item.upgrades.size()); i++) {
				const upgrade = item.upgrades[i];
				if (upgrade?.stats) {
					scaledStats = this.applyUpgrade(scaledStats, upgrade.stats);
				}
			}
		}

		const LEVEL_SCALING = 0.02;
		const levelMultiplier = 1 + math.clamp(level, 1, item.maxLevel) * LEVEL_SCALING;

		if (level > 1) scaledStats = this.scaleWithLevel(scaledStats, levelMultiplier);
		return scaledStats;
	}

	public getWeaponAttackAnimationSet(weapon: Readonly<Weapon>): AttackAnimation[] {
		switch (weapon.visualType) {
			case 'sword': {
				return SWORD_ATTACK_ANIMATION_SET;
			}
			default:
				return [];
		}
	}

	private applyUpgrade<T extends defined>(base: T, upgrade: Partial<T>): T {
		const result = deepClone(base);
		for (const [key] of ObjectUtils.entries(upgrade) as [keyof T, unknown][]) {
			const baseVal = result[key];
			const upVal = upgrade[key];

			if (typeIs(baseVal, 'number') && typeIs(upVal, 'number')) {
				result[key] = (baseVal + upVal) as T[typeof key];
			} else if (typeIs(upVal, 'number') && baseVal === undefined) {
				result[key] = upVal as T[typeof key];
			} else if (typeOf(baseVal) === 'table' && typeIs(upVal, 'table') && baseVal && upVal) {
				result[key] = this.applyUpgrade(baseVal, upVal);
			} else if (typeIs(upVal, 'table') && baseVal === undefined) {
				result[key] = deepClone(upVal) as T[typeof key];
			}
		}
		return result;
	}

	private scaleWithLevel<T extends defined>(stats: T, multiplier: number): T {
		const result = deepClone(stats);
		for (const [key, val] of ObjectUtils.entries(result) as [keyof T, unknown][]) {
			if (typeIs(val, 'number')) {
				result[key] = (val * multiplier) as T[typeof key];
			} else if (typeIs(val, 'table')) {
				result[key] = this.scaleWithLevel(val, multiplier) as T[typeof key];
			}
		}
		return result;
	}
}
