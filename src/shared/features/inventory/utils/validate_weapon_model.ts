import { WeaponModel } from '../types';

export function isWeaponModelValid(weapon: Instance): weapon is WeaponModel {
	if (!weapon.IsA('Model')) return false;
	const handle = weapon.FindFirstChild('Handle');
	if (!handle || !handle.IsA('BasePart')) return false;
	const rightGripAttachment = handle.FindFirstChild('RightGripAttachment');
	if (!rightGripAttachment || !rightGripAttachment.IsA('Attachment')) return false;
	const hitboxesContainer = handle.FindFirstChild('Hitboxes');
	if (
		!hitboxesContainer ||
		hitboxesContainer.GetChildren().size() === 0 ||
		(!hitboxesContainer.IsA('BasePart') && !hitboxesContainer.IsA('Attachment'))
	)
		return false;
	if (!weapon.FindFirstChild('Highlight')) return false;
	return true;
}
