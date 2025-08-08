import { Controller, OnStart } from '@flamework/core';
import { ClientEvents } from 'client/signals/networking/events';

@Controller()
export class ParticleController implements OnStart {
	public onStart(): void {
		ClientEvents.vfx.spawnDashParticles.connect(() => {
			// DO SOMETHING
		});
	}
}
