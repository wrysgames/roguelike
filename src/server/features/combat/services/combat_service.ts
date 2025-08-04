import { OnStart, Service } from '@flamework/core';
import { getWeapons } from 'shared/features/inventory/data/weapons';

@Service()
export class CombatService implements OnStart {
	public onStart(): void {
		print('Hello from CombatService!');
		print(getWeapons());
	}
}
