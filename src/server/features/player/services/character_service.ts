import { OnStart, Service } from '@flamework/core';
import { Character } from 'shared/types/character';
import { isCharacterModel } from 'shared/utils/character';
import { PlayerService } from './player_service';

@Service()
export class CharacterService implements OnStart {
	private characterAddedCallbacks: ((character: Character, player: Player) => void)[] = [];

	constructor(private playerService: PlayerService) {}

	public onStart(): void {
		this.playerService.addPlayerAddedCallback((player) => {
			player.CharacterAdded.Connect((character) => {
				if (!isCharacterModel(character)) return;
				this.characterAddedCallbacks.forEach((callback) => {
					task.spawn(callback, character, player);
				});
			});
		});
	}

	public addCharacterAddedCallback(callback: (character: Character, player: Player) => void): void {
		if (!this.characterAddedCallbacks.includes(callback)) {
			this.characterAddedCallbacks.push(callback);
		}
	}
}
