import { OnStart, Service } from '@flamework/core';
import { Character } from 'shared/types/character';
import { isCharacterModel } from 'shared/utils/character';
import { CharacterState } from '../utils/character_state';
import { PlayerService } from './player_service';

@Service()
export class CharacterService implements OnStart {
	private characterStates: Map<Character, CharacterState> = new Map();
	private animationFlyweight: Map<string, Animation> = new Map();
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
			if (state.isJumpEnabled) return;
			character.Humanoid.JumpPower = state.jumpPower;
			character.Humanoid.JumpHeight = state.jumpHeight;
			state.isJumpEnabled = true;
		}
	}

	public disableJump(character: Character): void {
		const state = this.characterStates.get(character);
		if (!state) {
			const newState = new CharacterState();
			newState.jumpHeight = character.Humanoid.JumpHeight;
			newState.jumpPower = character.Humanoid.JumpPower;
			newState.isJumpEnabled = false;
			this.characterStates.set(character, newState);

			character.Humanoid.JumpPower = 0;
			character.Humanoid.JumpHeight = 0;
		} else {
			if (!state.isJumpEnabled) return;
			state.isJumpEnabled = false;
			character.Humanoid.JumpPower = 0;
			character.Humanoid.JumpHeight = 0;
		}
	}

	public isInAir(character: Character): boolean {
		const state = character.Humanoid.GetState();
		if (
			state === Enum.HumanoidStateType.Jumping ||
			state === Enum.HumanoidStateType.Flying ||
			state === Enum.HumanoidStateType.Freefall
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

	public getMoveDirectionCFrame(character: Character): CFrame {
		const direction = character.Humanoid.MoveDirection;
		const position = character.HumanoidRootPart.Position;
		const moveDirection = direction.Unit;
		return CFrame.lookAt(position, position.add(moveDirection));
	}

	public getMoveDirection(character: Character) {
		return character.Humanoid.MoveDirection;
	}

	public loadAnimation(character: Character, animationId: string): AnimationTrack {
		const animator = character.Humanoid.Animator;

		// create a new animation
		let animation = this.animationFlyweight.get(animationId);
		if (!animation) {
			animation = new Instance('Animation');
			animation.AnimationId = animationId;
			this.animationFlyweight.set(animationId, animation);
		}

		const animationTrack = animator.LoadAnimation(animation);
		return animationTrack;
	}
}
