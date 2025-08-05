import { OnStart, Service } from '@flamework/core';
import { ServerEvents } from 'server/signals/networking/events';

@Service()
export class CombatService implements OnStart {
	public onStart(): void {
		ServerEvents.dash.connect((player) => {
			print('Dash on server', player);
		});
	}
}
