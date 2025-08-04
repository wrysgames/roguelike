import { OnStart, Service } from '@flamework/core';
import ObjectUtils from '@rbxts/object-utils';
import { DataService } from 'server/features/datastore/services/data_service';
import { getArmorById } from 'shared/features/inventory/data/armor';
import { getWeaponById } from 'shared/features/inventory/data/weapons';
import { BaseItem, InferStats, InferTags, Weapon } from 'shared/features/inventory/types';

@Service()
export class WeaponService implements OnStart {
	constructor(private dataService: DataService) {}

	public onStart(): void {
		this.dataService.onPlayerDataLoaded.Connect((player, data) => {
			const armor = getArmorById('armor:wooden_armor');
			if (armor) print(this.calculateItemStats(armor, 2, 1));
		});
	}

	public getEquippedWeapon(player: Player): Readonly<Weapon> | undefined {
		const weaponId = this.dataService.getEquippedWeapon(player)?.id;
		if (weaponId) {
			return getWeaponById(weaponId);
		}
		return undefined;
	}

	public calculateItemStats<T extends BaseItem<InferStats<T>, InferTags<T>>>(
		item: T,
		tier: number,
		level: number,
	): InferStats<T> {
		let scaledStats: InferStats<T> = this.deepClone(item.baseStats);

		// --- 1. Apply Tier Upgrades ---
		if (item.upgrades) {
			for (let i = 0; i < math.min(tier, item.maxTiers, item.upgrades.size()); i++) {
				const upgrade = item.upgrades[i];
				if (upgrade?.stats) {
					scaledStats = this.applyUpgrade(scaledStats, upgrade.stats);
				}
			}
		}

		// --- 2. Apply Level Scaling ---
		const LEVEL_SCALING = 0.02;
		const levelMultiplier = 1 + math.clamp(level, 1, item.maxLevel) * LEVEL_SCALING;

		if (level > 1) scaledStats = this.scaleWithLevel(scaledStats, levelMultiplier);
		return scaledStats;
	}

	private applyUpgrade<T>(base: T, upgrade: Partial<T>): T {
		const result = this.deepClone(base);
		for (const [key] of ObjectUtils.entries(upgrade) as [keyof T, unknown][]) {
			const baseVal = result[key];
			const upVal = upgrade[key];

			if (typeIs(baseVal, 'number') && typeIs(upVal, 'number')) {
				result[key] = (baseVal + upVal) as T[typeof key];
			} else if (typeIs(upVal, 'number') && baseVal === undefined) {
				// If the key is new and is a number, just set it
				result[key] = upVal as T[typeof key];
			} else if (typeOf(baseVal) === 'table' && typeIs(upVal, 'table') && baseVal && upVal) {
				result[key] = this.applyUpgrade(baseVal, upVal);
			} else if (typeIs(upVal, 'table') && baseVal === undefined) {
				// If the key is new and is a table, deep clone it
				result[key] = this.deepClone(upVal) as T[typeof key];
			}
		}
		return result;
	}

	private scaleWithLevel<T extends defined>(stats: T, multiplier: number): T {
		const result = this.deepClone(stats);
		for (const [key, val] of ObjectUtils.entries(result) as [keyof T, unknown][]) {
			if (typeIs(val, 'number')) {
				result[key] = (val * multiplier) as T[typeof key];
			} else if (typeIs(val, 'table')) {
				result[key] = this.scaleWithLevel(val, multiplier) as T[typeof key];
			}
		}
		return result;
	}

	private deepClone<T>(obj: T): T {
		if (typeIs(obj, 'table')) {
			const result = {} as T;
			for (const [key, value] of ObjectUtils.entries(obj) as [keyof T, unknown][]) {
				result[key] = this.deepClone(value) as T[keyof T];
			}
			return result;
		}
		return obj;
	}
}
