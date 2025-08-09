import { getDescendantsOfType } from 'shared/utils/instance';
import { DEFAULT_EMIT_COUNT } from '../constants/particles';

export function setVfxInstanceCFrame(instance: Instance, cframe: CFrame): void {
	if (instance.IsA('BasePart')) {
		instance.CFrame = cframe;
	} else if (instance.IsA('Attachment')) {
		instance.WorldCFrame = cframe;
	}
}

export function emitParticlesInModel(model: Instance): Promise<void> {
	return new Promise((resolve) => {
		const particles = getDescendantsOfType(model, 'ParticleEmitter');

		if (particles.size() === 0) {
			resolve();
			return;
		}

		let destroyedCount = 0;
		const total = particles.size();

		for (const particle of particles) {
			particle.Rate = 0;
			const emitCount = particle.GetAttribute('EmitCount');
			if (emitCount !== undefined && !typeIs(emitCount, 'number')) continue;

			const emitDelay = particle.GetAttribute('EmitDelay');
			if (emitDelay !== undefined && !typeIs(emitDelay, 'number')) continue;

			const doEmit = () => {
				particle.Emit(emitCount ?? DEFAULT_EMIT_COUNT);
				task.delay(math.max(particle.Lifetime.Max, 0.05), () => {
					particle.Destroy();
					destroyedCount++;
					if (destroyedCount === total) {
						resolve();
					}
				});
			};

			if (emitDelay !== undefined && emitDelay > 0) {
				task.delay(emitDelay, doEmit);
			} else {
				doEmit();
			}
		}
	});
}
