import { Controller, OnStart } from '@flamework/core';
import { ReplicatedStorage } from '@rbxts/services';
import { ClientEvents } from 'client/signals/networking/events';
import { getDescendantsOfType } from 'shared/utils/instance';

const DEFAULT_EMIT_COUNT = 5;

@Controller()
export class ParticleController implements OnStart {
	public onStart(): void {
		ClientEvents.vfx.spawnDashParticles.connect(() => {
			// DO SOMETHING
		});
		ClientEvents.vfx.spawnSlashParticles.connect((adornee: BasePart) => {
			// DO SOMETHING
		});
	}

	public spawnSlashParticles(adornee: BasePart): void {
		const vfxAttachment = ReplicatedStorage.vfx.combat.FindFirstChild('slash_fx');
		if (!vfxAttachment) return;

		const clone = vfxAttachment.Clone();
		this.emitParticlesInModel(clone).andThen(() => {
			clone.Destroy();
		});
	}

	private emitParticlesInModel(model: Instance): Promise<void> {
		return new Promise((resolve) => {
			const particles = getDescendantsOfType(model, 'ParticleEmitter');

			if (particles.size() === 0) {
				resolve();
				return;
			}

			let destroyedCount = 0;
			const total = particles.size();

			for (const particle of particles) {
				const emitCount = particle.GetAttribute('EmitCount');
				if (emitCount !== undefined && !typeIs(emitCount, 'number')) continue;

				const emitDelay = particle.GetAttribute('EmitDelay');
				if (emitDelay !== undefined && !typeIs(emitDelay, 'number')) continue;

				const doEmit = () => {
					particle.Emit(emitCount ?? DEFAULT_EMIT_COUNT);
					task.delay(particle.Lifetime.Max, () => {
						particle.Destroy();
						destroyedCount++;
						if (destroyedCount === total) {
							resolve();
						}
					});
				};

				if (emitDelay) {
					task.delay(emitDelay, doEmit);
				} else {
					doEmit();
				}
			}
		});
	}
}
