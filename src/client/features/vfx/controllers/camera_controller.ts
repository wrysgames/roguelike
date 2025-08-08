import { Controller, OnStart } from '@flamework/core';
import CameraShaker from '@rbxts/camera-shaker';
import { Workspace } from '@rbxts/services';
import { ClientEvents } from 'client/signals/networking/events';

@Controller()
export class CameraController implements OnStart {
	private cameraShaker: CameraShaker = new CameraShaker(Enum.RenderPriority.Camera.Value, (shakeCFrame) => {
		const camera = Workspace.CurrentCamera;
		if (camera) {
			camera.CFrame = camera.CFrame.mul(shakeCFrame);
		}
	});

	public onStart(): void {
		ClientEvents.vfx.shakeCamera.connect(() => {
			this.shakeCamera();
		});
	}

	public shakeCamera(): void {
		this.cameraShaker.Start();
		const preset = CameraShaker.Presets.Bump;
		preset.Magnitude /= 2;
		preset.Roughness = 8;
		preset.fadeInDuration /= 2;
		preset.fadeOutDuration /= 2;
		this.cameraShaker.ShakeOnce(
			preset.Magnitude,
			preset.Roughness,
			preset.fadeInDuration,
			preset.fadeOutDuration,
			preset.PositionInfluence,
			preset.RotationInfluence,
		);
	}
}
