import { Controller, OnStart } from '@flamework/core';
import { InputManager } from 'client/shared/utils/input_manager';
import { ClientEvents } from 'client/signals/networking/events';

@Controller()
export class CombatController implements OnStart {
	private inputManager: InputManager;

	constructor() {
		this.inputManager = InputManager.getInstance();
	}

	onStart(): void {
		this.inputManager.bindAction({
			name: 'dash',
			keys: [Enum.KeyCode.Q],
			callback: () => {
				ClientEvents.combat.dash.fire();
			},
		});

		this.inputManager.bindAction({
			name: 'attack',
			inputTypes: [Enum.UserInputType.MouseButton1],
			callback: () => {
				ClientEvents.combat.attack.fire();
			},
		});

		this.inputManager.bindAction({
			name: 'attack',
			keys: [Enum.KeyCode.E],
			callback: () => {
				ClientEvents.combat.equip.fire('1');
			},
		});
	}
}
