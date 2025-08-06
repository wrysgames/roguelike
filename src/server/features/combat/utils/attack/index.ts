import { AttackAnimation } from 'shared/types/animation';

export class AttackState {
	equippedWeaponModel?: Model;
	currentAttackAnimation?: AttackAnimation;
	hitboxConnection?: RBXScriptConnection | undefined;
	comboIndex: number = 0;
	comboResetTask?: thread | undefined;
	isComboCooldownActive: boolean = false;
	isDashCooldownActive: boolean = false;
	isComboQueued: boolean = false;
	isComboWindowOpen: boolean = false;
	isAttacking: boolean = false;
	isHitboxActive: boolean = false;
}
