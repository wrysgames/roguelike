import { Character, R15Character } from 'shared/types/character';

export function isCharacterModel(character: Instance): character is Character {
	const humanoid = character.FindFirstChildWhichIsA('Humanoid');
	if (!humanoid) return false;
	const animator = humanoid.FindFirstChild('Animator');
	if (!animator) return false;
	const humanoidRootPart = character.FindFirstChild('HumanoidRootPart');
	if (!humanoidRootPart) return false;
	return true;
}

export function isR15CharacterModel(character: Instance): character is R15Character {
	if (!isCharacterModel(character)) return false;
	const rightHand = character.FindFirstChild('RightHand');
	if (!rightHand) return false;
	const rightGripAttachment = rightHand.FindFirstChild('RightGripAttachment');
	if (!rightGripAttachment) return false;
	return true;
}

export function assertCharacterModel(character: Instance): asserts character is Character {
	const humanoid = character.FindFirstChildWhichIsA('Humanoid');
	if (!humanoid) {
		throw '[validateCharacterModel]: Model is missing Humanoid';
	}
	const animator = humanoid.FindFirstChild('Animator');
	if (!animator) throw '[validateCharacterModel]: Humanoid is missing Animator';
	const humanoidRootPart = character.FindFirstChild('HumanoidRootPart');
	if (!humanoidRootPart) throw '[validateCharacterModel]: Model is missing HumanoidRootPart';
}

export function assertR15CharacterModel(character: Instance): asserts character is R15Character {
	// Delegate main character model logic to assertCharacterModel
	assertCharacterModel(character);
	const rightHand = character.FindFirstChild('RightHand');
	if (!rightHand) throw '[validateR15CharacterModel]: Model is missing RightHand';
	const rightGripAttachment = rightHand.FindFirstChild('RightGripAttachment');
	if (!rightGripAttachment) throw '[validateR15CharacterModel]: RightHand is missing RightGripAttachment';
}
