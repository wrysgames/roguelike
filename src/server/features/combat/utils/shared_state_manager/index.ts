import { AttackState } from '../attack';
import { DashState } from '../dash';

export class SharedStateManager {
	private attackStates: Map<Player, AttackState> = new Map();
	private dashStates: Map<Player, DashState> = new Map();

	private static instance: SharedStateManager | undefined;
	private constructor() {}

	public static getInstance(): SharedStateManager {
		if (!this.instance) {
			const newInstance = new SharedStateManager();
			this.instance = newInstance;
			return newInstance;
		}
		return this.instance;
	}

	public getAttackState(player: Player): AttackState {
		const state = this.attackStates.get(player);
		if (!state) {
			const newAttackState = new AttackState();
			this.attackStates.set(player, newAttackState);
			return newAttackState;
		}
		return state;
	}

	public getDashState(player: Player): DashState {
		const state = this.dashStates.get(player);
		if (!state) {
			const newDashState = new DashState();
			this.dashStates.set(player, newDashState);
			return newDashState;
		}
		return state;
	}
}
