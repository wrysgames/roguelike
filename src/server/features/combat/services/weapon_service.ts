import { OnStart, Service } from '@flamework/core';
import { DataService } from 'server/features/datastore/services/data_service';
import { getWeaponById } from 'shared/features/inventory/data/weapons';

@Service()
export class WeaponService implements OnStart {
	constructor(private dataService: DataService) {}

	public onStart(): void {
		this.dataService.onPlayerDataLoaded.Connect((player, data) => {
			const weaponId = data.inventory[0]?.id;
			if (!weaponId) return;
			const weaponWithId = getWeaponById(weaponId);
			print(`Found weapon with ID "${weaponId}": `, weaponWithId);
		});
	}
}
