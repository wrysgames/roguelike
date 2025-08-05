interface KeyframeRange {
	start?: string;
	end?: string;
}

export interface AttackAnimation {
	animationId: string;
	keyframes: {
		hitbox: Required<KeyframeRange>;
		combo?: KeyframeRange;
	};
}
