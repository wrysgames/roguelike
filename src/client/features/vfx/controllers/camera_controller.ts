import { Controller, OnStart } from '@flamework/core';
import { ClientEvents } from 'client/signals/networking/events';

@Controller()
export class CameraController implements OnStart {
	public onStart(): void {
		ClientEvents.vfx.shakeCamera.connect(() => {
			// DO SOMETHING
		});
	}
}
