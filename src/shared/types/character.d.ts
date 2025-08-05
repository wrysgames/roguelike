interface AnimateScript extends LocalScript {
	walk: StringValue & {
		WalkAnim: Animation;
	};
	run: StringValue & {
		RunAnim: Animation;
	};
	idle: StringValue & {
		Animation1: Animation;
		Animation2: Animation;
	};
	jump: StringValue & {
		JumpAnim: Animation;
	};
	fall: StringValue & {
		FallAnim: Animation;
	};
	climb: StringValue & {
		ClimbAnim: Animation;
	};
}

export interface Character extends Model {
	Humanoid: Humanoid & {
		Animator: Animator;
	};
	Animate: AnimateScript;
	HumanoidRootPart: BasePart;
}

export interface R15Character extends Character {
	RightHand: BasePart & {
		RightGripAttachment: Attachment;
	};
}
