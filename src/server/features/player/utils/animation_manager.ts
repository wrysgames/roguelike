import { Character } from 'shared/types/character';

export class AnimationManager {
	private character: Character;
	private animationCache: Map<string, AnimationTrack> = new Map();

	constructor(character: Character) {
		this.character = character;
	}

	public loadAnimation(animationId: string): AnimationTrack {
		const animator = this.character.Humanoid.Animator;

		let animationTrack = this.animationCache.get(animationId);
		if (!animationTrack) {
			const animation = new Instance('Animation');
			animation.AnimationId = animationId;
			const track = animator.LoadAnimation(animation);
			this.animationCache.set(animationId, track);
			animation.Destroy();
			return track;
		}

		return animationTrack;
	}

	public preloadAnimations(animationIds: string[]) {
		let numPreloaded = 0;

		animationIds.forEach((animationId) => {
			if (this.animationCache.has(animationId)) return;

			const track = this.loadAnimation(animationId);

			track.Play();
			track.AdjustSpeed(0);
			this.animationCache.set(animationId, track);

			task.defer(() => track.Stop()); // Stop after a frame
			numPreloaded++;
		});

		print(`Preloaded ${numPreloaded} animations for ${this.character.Humanoid.DisplayName}`);
	}
}
