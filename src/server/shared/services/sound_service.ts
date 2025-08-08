import { Service } from '@flamework/core';

@Service()
export class SoundService {
	public makeSound(
		soundId: string,
		parent: Instance,
		props?: Partial<WritableInstanceProperties<Sound>>,
		playAndDestroy?: false,
	): Sound;
	public makeSound(
		soundId: string,
		parent: Instance,
		props: Partial<WritableInstanceProperties<Sound>> | undefined,
		playAndDestroy: true,
	): Promise<void>;
	public makeSound(
		soundId: string,
		parent: Instance,
		props?: Partial<WritableInstanceProperties<Sound>>,
		playAndDestroy?: boolean,
	): Sound | Promise<void> {
		const sound = new Instance('Sound');
		sound.SoundId = soundId;
		sound.Parent = parent;
		if (props) {
			for (const [key, value] of pairs(props)) {
				(sound[key] as unknown) = value;
			}
		}
		if (playAndDestroy) {
			sound.Play();
			return new Promise<void>((resolve) => {
				sound.Ended.Once(() => {
					sound.Destroy();
					resolve();
				});
			});
		}
		return sound;
	}
}
