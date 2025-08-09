import { Controller, OnStart } from '@flamework/core';
import { ReplicatedStorage } from '@rbxts/services';
import { ClientEvents } from 'client/signals/networking/events';
import { emitParticlesInModel, setVfxInstanceCFrame } from '../utils/emit';

@Controller()
export class ParticleController implements OnStart {
	public onStart(): void {
		ClientEvents.vfx.spawnDashParticles.connect(() => {
			// DO SOMETHING
		});

		ClientEvents.vfx.spawnDotNebula.connect((adornee: BasePart) => {
			this.spawnDotNebula(adornee);
		});
		ClientEvents.vfx.spawnSlashEffect.connect((adornee: BasePart) => {
			this.spawnSlashEffect(adornee);
		});
		ClientEvents.vfx.spawnHitspark.connect((adornee: BasePart) => {
			this.spawnHitspark(adornee);
		});
		ClientEvents.vfx.spawnCritBlood.connect((adornee: BasePart) => {
			this.spawnCritBlood(adornee);
		});
	}

	public spawnDotNebula(adornee: BasePart): void {
		const vfxAttachment = ReplicatedStorage.vfx.combat.FindFirstChild('dot_nebula');
		if (!vfxAttachment) return;

		const clone = vfxAttachment.Clone();
		clone.Parent = adornee;
		emitParticlesInModel(clone).andThen(() => {
			clone.Destroy();
		});
	}

	public spawnSlashEffect(adornee: BasePart): void {
		const vfxAttachment = ReplicatedStorage.vfx.combat.FindFirstChild('slash');
		if (!vfxAttachment) return;

		const clone = vfxAttachment.Clone();
		clone.Parent = adornee;
		emitParticlesInModel(clone).andThen(() => {
			clone.Destroy();
		});
	}

	public spawnHitspark(adornee: BasePart): void {
		const vfxAttachment = ReplicatedStorage.vfx.combat.FindFirstChild('hitspark');
		if (!vfxAttachment) return;

		const clone = vfxAttachment.Clone();
		clone.Parent = adornee;
		emitParticlesInModel(clone).andThen(() => {
			clone.Destroy();
		});
	}

	public spawnCritBlood(adornee: BasePart): void {
		const vfxAttachment = ReplicatedStorage.vfx.combat.FindFirstChild('crit_blood');
		if (!vfxAttachment) return;

		const clone = vfxAttachment.Clone();
		clone.Parent = adornee;
		emitParticlesInModel(clone).andThen(() => {
			clone.Destroy();
		});
	}
}
