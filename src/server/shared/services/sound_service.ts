import { OnStart, Service } from '@flamework/core';
import { ContentProvider } from '@rbxts/services';
import { CRITICAL_HIT_SOUND_ID, ENEMY_HIT_SOUND_ID, SWORD_SLASH_SOUND_ID } from 'shared/constants/sounds/combat_sounds';

interface SoundOptions {
	playbackSpeed?: number;
	volume?: number;
}

@Service()
export class SoundService implements OnStart {
	public onStart(): void {
		this.preloadSounds([SWORD_SLASH_SOUND_ID, ENEMY_HIT_SOUND_ID, CRITICAL_HIT_SOUND_ID]);
	}

	public makeSound(soundId: string, parent?: Instance, props?: Partial<SoundOptions>, playAndDestroy?: false): Sound;
	public makeSound(
		soundId: string,
		parent: Instance,
		props: Partial<SoundOptions> | undefined,
		playAndDestroy: true,
	): Promise<void>;
	public makeSound(
		soundId: string,
		parent?: Instance,
		props?: Partial<SoundOptions>,
		playAndDestroy?: boolean,
	): Sound | Promise<void> {
		const sound = new Instance('Sound');
		sound.SoundId = soundId;
		sound.Parent = parent;
		if (props) {
			if (props.playbackSpeed) {
				sound.PlaybackSpeed = props.playbackSpeed;
			}
			if (props.volume) {
				sound.Volume = props.volume;
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

	public preloadSounds(soundIds: string[]): void {
		const soundInstances = soundIds.map((soundId) => this.makeSound(soundId));
		let totalPreloaded = 0,
			successfulPreloaded = 0;
		ContentProvider.PreloadAsync(soundInstances, (contentId, assetFetchStatus) => {
			totalPreloaded++;
			if (assetFetchStatus !== Enum.AssetFetchStatus.Success) {
				print(`Sound ${contentId} could not be loaded`);
			} else {
				successfulPreloaded++;
			}

			if (totalPreloaded === soundIds.size()) {
				print(
					`Attempted to preload ${totalPreloaded} sounds. ${successfulPreloaded}/${totalPreloaded} successful`,
				);
			}
		});
	}
}
