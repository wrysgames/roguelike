import { OnStart, Service } from '@flamework/core';
import { Players } from '@rbxts/services';

@Service()
export class PlayerService implements OnStart {
	private playerJoinedCallbacks: ((player: Player) => void)[];
	private playerLeavingCallbacks: ((player: Player) => void)[];

	constructor() {
		this.playerJoinedCallbacks = [];
		this.playerLeavingCallbacks = [];
	}

	public onStart(): void {
		Players.PlayerAdded.Connect((player) => {
			this.playerJoinedCallbacks.forEach((callback) => {
				task.spawn(callback, player);
			});
		});

		Players.PlayerRemoving.Connect((player) => {
			this.playerLeavingCallbacks.forEach((callback) => {
				task.spawn(callback, player);
			});
		});
	}

	public addPlayerAddedCallback(callback: (player: Player) => void): void {
		if (!this.playerJoinedCallbacks.includes(callback)) {
			this.playerJoinedCallbacks.push(callback);
		}
	}

	public addPlayerLeavingCallback(callback: (player: Player) => void): void {
		if (!this.playerLeavingCallbacks.includes(callback)) {
			this.playerLeavingCallbacks.push(callback);
		}
	}
}
