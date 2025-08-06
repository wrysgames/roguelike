import { OnStart, Service } from '@flamework/core';
import ObjectUtils from '@rbxts/object-utils';
import { DataService } from 'server/features/datastore/services/data_service';
import { StoredItemData } from 'server/features/datastore/types/schemas/inventory';
import { ServerEvents } from 'server/signals/networking/events';
import { getArmorById } from 'shared/features/inventory/data/armor';
import { Armor, BaseItem, InferStats, InferTags } from 'shared/features/inventory/types';
import { deepClone } from 'shared/utils/instance';

@Service()
export class ItemService implements OnStart {
	constructor(private dataService: DataService) {}

	public onStart(): void {
		ServerEvents.combat.equip.connect((player, instanceId) => {
			const item = this.dataService.getInstanceFromPlayerInventory(player, instanceId);
			if (!item) return;
			print(`Equipping ${item.id} to slot: ${item.type} for player ${player.DisplayName}`);
			this.dataService.equipItem(player, instanceId);
		});
	}

	public equipItem(player: Player, instanceId: string): void {
		this.dataService.equipItem(player, instanceId);
	}

	public getEquippedWeapon(player: Player): Readonly<StoredItemData> | undefined {
		return this.dataService.getEquippedWeapon(player);
	}

	public getEquippedArmor(player: Player): Readonly<Armor> | undefined {
		const armorId = this.dataService.getEquippedArmor(player)?.id;
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
