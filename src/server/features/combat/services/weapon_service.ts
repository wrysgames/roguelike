import { OnStart, Service } from '@flamework/core';
import { DataService } from 'server/features/datastore/services/data_service';
import { getWeaponById } from 'shared/features/inventory/data/weapons';
import { Weapon } from 'shared/features/inventory/types';

@Service()
export class WeaponService implements OnStart {
	constructor(private dataService: DataService) {}

	public onStart(): void {
		this.dataService.onPlayerDataLoaded.Connect((player, data) => {
			const weaponId = data.equipped.weapon?.id;
			weaponId && getWeaponById(weaponId);
		});
	}

	public getEquippedWeapon(player: Player): Readonly<Weapon> | undefined {
		const weaponId = this.dataService.getEquippedWeapon(player)?.id;
		if (weaponId) {
			return getWeaponById(weaponId);
		}
		return undefined;
	}
}
