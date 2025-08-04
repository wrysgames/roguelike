import { Controller, OnStart } from '@flamework/core';
import { InputManager } from 'client/shared/utils/input_manager';

@Controller()
export class CombatController implements OnStart {
	private inputManager: InputManager;

	constructor() {
		this.inputManager = InputManager.getInstance();
	}

	onStart(): void {
		this.inputManager.bindAction({
			name: 'test',
			keys: [Enum.KeyCode.Q],
			callback: () => {
				print('DASH!!!');
			},
		});
	}
}
