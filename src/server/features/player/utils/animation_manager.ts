import { Character } from 'shared/types/character';

export class AnimationManager {
	private character: Character;
	private animationCache: Map<string, Animation> = new Map();

	constructor(character: Character) {
		this.character = character;
	}

	public loadAnimation(animationId: string): AnimationTrack {
		const animator = this.character.Humanoid.Animator;

		let animation = this.animationCache.get(animationId);
		if (!animation) {
			animation = new Instance('Animation');
			animation.AnimationId = animationId;
			this.animationCache.set(animationId, animation);
		}
		return animator.LoadAnimation(animation);
	}

	public preloadAnimations(animationIds: string[]) {
		animationIds.forEach((animationId) => {
			if (this.animationCache.has(animationId)) return;

			const track = this.loadAnimation(animationId);
			track.Play();
			track.AdjustSpeed(0);

			task.defer(() => {
				track.Stop();
				track.AdjustSpeed(1);
			}); // Stop after a frame
		});
	}
}
