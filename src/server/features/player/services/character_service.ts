import { OnStart, Service } from '@flamework/core';
import {
	DASH_AIR_ANIMATION_ID,
	DASH_BACK_ANIMATION_ID,
	DASH_GROUND_ANIMATION_ID,
} from 'shared/constants/animations/dash';
import { Character, R15Character } from 'shared/types/character';
import { isCharacterModel } from 'shared/utils/character';
import { AnimationManager } from '../utils/animation_manager';
import { CharacterState } from '../utils/character_state';
import { PlayerService } from './player_service';

@Service()
export class CharacterService implements OnStart {
	private characterStates: Map<Character, CharacterState> = new Map();
	private characterAnimations: Map<Character, AnimationManager> = new Map();

	private characterAddedCallbacks: ((character: Character, player: Player) => void)[] = [];

	constructor(private playerService: PlayerService) {}

	public onStart(): void {
		this.playerService.addPlayerAddedCallback((player) => {
			player.CharacterAdded.Connect((character) => {
				if (!isCharacterModel(character)) return;
				this.characterAnimations.set(character, new AnimationManager(character));
				this.characterAddedCallbacks.forEach((callback) => {
					task.spawn(callback, character, player);
				});
			});
			player.CharacterRemoving.Connect((character) => {
				if (!isCharacterModel(character)) return;
				this.preloadAnimations(character, [
					DASH_AIR_ANIMATION_ID,
					DASH_BACK_ANIMATION_ID,
					DASH_GROUND_ANIMATION_ID,
				]);
				this.characterAnimations.delete(character);
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
		let animationManager = this.getCharacterAnimationManager(character);
		return animationManager.loadAnimation(animationId);
	}

	public mountPartToRightHand(character: R15Character, part: BasePart, cframe?: CFrame): Motor6D {
		const rightHand = character.RightHand;
		const gripAttachment = rightHand.RightGripAttachment;

		const motor = new Instance('Motor6D');
		motor.Part0 = rightHand;
		motor.Part1 = part;
		motor.Parent = rightHand;

		motor.C0 = gripAttachment.CFrame;
		if (cframe) motor.C1 = cframe;

		return motor;
	}

	public preloadAnimations(character: Character, animationIds: string[]) {
		let animationManager = this.getCharacterAnimationManager(character);
		return animationManager.preloadAnimations(animationIds);
	}

	private getCharacterAnimationManager(character: Character): AnimationManager {
		const characterAnimationManager = this.characterAnimations.get(character);
		if (!characterAnimationManager) {
			const newManager = new AnimationManager(character);
			this.characterAnimations.set(character, newManager);
			return newManager;
		}
		return characterAnimationManager;
	}
}
