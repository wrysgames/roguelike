interface KeyframeRange {
	start?: string;
	end?: string;
}

export interface AttackAnimation {
	animationId: string;
	damageMultiplier?: number;
	keyframes?: {
		hitbox?: KeyframeRange;
		combo?: KeyframeRange;
	};
	sounds?: {
		attack?: string;
		hitConfirmed?: string;
	};
}
