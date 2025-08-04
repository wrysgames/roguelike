import { OnStart, Service } from '@flamework/core';
import { DataService } from 'server/features/datastore/services/data_service';
import { getWeaponById } from 'shared/features/inventory/data/weapons';
import { Weapon, WeaponStats } from 'shared/features/inventory/types';

@Service()
export class WeaponService implements OnStart {
	constructor(private dataService: DataService) {}

	public onStart(): void {
		this.dataService.onPlayerDataLoaded.Connect((player, data) => {
			const weapon = this.getEquippedWeapon(player);
			if (weapon) print(this.calculateWeaponStats(weapon, 3, 1));
		});
	}

	public getEquippedWeapon(player: Player): Readonly<Weapon> | undefined {
		const weaponId = this.dataService.getEquippedWeapon(player)?.id;
		if (weaponId) {
			return getWeaponById(weaponId);
		}
		return undefined;
	}

	public calculateWeaponStats(weapon: Readonly<Weapon>, tier: number, level: number): WeaponStats {
		// Shallow copy the stats to avoid mutating fixed data
		const scaledStats = { ...weapon.baseStats };

		// --- 1. Apply Tier Upgrades ---
		if (weapon.upgrades) {
			for (let i = 0; i < tier && i < math.min(weapon.upgrades?.size(), weapon.maxTiers); i++) {
				const upgrade = weapon.upgrades[i];
				if (!upgrade) continue;

				for (const [statKey, statValue] of pairs(upgrade.stats)) {
					scaledStats[statKey as keyof WeaponStats] =
						(scaledStats[statKey as keyof WeaponStats] ?? 0) + statValue;
				}
			}
		}

		// --- 2. Apply Level Scaling (e.g. +2% per level) ---
		const LEVEL_SCALE = 0.02; // 2% increase per level
		if (level > 1) {
			for (const key of pairs(scaledStats)) {
				const statKey = key[0] as keyof WeaponStats;
				const baseValue = scaledStats[statKey];
				if (typeIs(baseValue, 'number')) {
					const bonusMultiplier = 1 + LEVEL_SCALE * math.clamp(level - 1, 1, weapon.maxLevel - 1);
					scaledStats[statKey] = baseValue * bonusMultiplier;
				}
			}
		}
		return scaledStats;
	}
}
