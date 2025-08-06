import { OnStart, Service } from '@flamework/core';
import { Character } from 'shared/types/character';
import { isCharacterModel } from 'shared/utils/character';
import { CharacterState } from '../utils/character_state';
import { PlayerService } from './player_service';

@Service()
export class CharacterService implements OnStart {
	private characterStates: Map<Character, CharacterState> = new Map();
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
			player.CharacterRemoving.Connect((character) => {
				if (!isCharacterModel(character)) return;
				this.characterStates.delete(character);
			});
		});
	}

	public addCharacterAddedCallback(callback: (character: Character, player: Player) => void): void {
		if (!this.characterAddedCallbacks.includes(callback)) {
			this.characterAddedCallbacks.push(callback);
		}
	}

	public enableJump(character: Character): void {
		const state = this.characterStates.get(character);
		if (!state) {
			character.Humanoid.JumpPower = 50;
			character.Humanoid.JumpHeight = 7.2;
		} else {
			character.Humanoid.JumpPower = state.jumpPower;
			character.Humanoid.JumpHeight = state.jumpHeight;
		}
	}

	public disableJump(character: Character): void {
		const state = this.characterStates.get(character);
		if (!state) {
			const newState = new CharacterState();
			newState.jumpHeight = character.Humanoid.JumpHeight;
			newState.jumpPower = character.Humanoid.JumpPower;
			this.characterStates.set(character, newState);
		} else {
			state.jumpHeight = character.Humanoid.JumpHeight;
			state.jumpPower = character.Humanoid.JumpPower;
		}

		character.Humanoid.JumpPower = 0;
		character.Humanoid.JumpHeight = 0;
	}

	public isInAir(character: Character): boolean {
		const state = character.Humanoid.GetState();
		if (
			state === Enum.HumanoidStateType.Jumping ||
			state === Enum.HumanoidStateType.FallingDown ||
			state === Enum.HumanoidStateType.Flying
		)
			return true;
		return false;
	}

	public isMovingBackwards(character: Character): boolean {
		const direction = character.Humanoid.MoveDirection;
		const facing = character.HumanoidRootPart.CFrame.LookVector;
		const moveDirection = direction.Unit;
		return moveDirection.Dot(facing) < -0.5;
	}

	public getFrontOrientation(character: Character): CFrame {
		const direction = character.Humanoid.MoveDirection;
		const position = character.HumanoidRootPart.Position;
		const moveDirection = direction.Unit;
		return CFrame.lookAt(position, position.add(moveDirection));
	}
}
