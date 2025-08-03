import { UserInputService } from '@rbxts/services';

export type InputContext = string;

export interface InputActionBinding {
    name: string;

    keys?: Enum.KeyCode[];
    inputTypes?: Enum.UserInputType[];

    callback: (inputObject: InputObject, gameProcessed: boolean) => void;

    context?: InputContext;
    consumeInput?: boolean;
    priority?: number;
}

const DEFAULT_PRIORITY = 999;

export class InputManager {
    private readonly bindings: Map<string, InputActionBinding[]> = new Map();
    private static readonly instance: InputManager = new InputManager();
    private currentContext: string = 'Game';

    private constructor() {
        UserInputService.InputBegan.ConnectParallel((input, gameProcessed) => {
            if (gameProcessed) return;

            for (let [_, bindings] of this.bindings) {
                // sort based on priority
                bindings = bindings.sort((a, b) => {
                    return (a.priority ?? DEFAULT_PRIORITY) < (b.priority ?? DEFAULT_PRIORITY);
                });
                for (const binding of bindings) {
                    const matchesKey = binding.keys && binding.keys.includes(input.KeyCode);
                    const matchesInputType = binding.inputTypes && binding.inputTypes.includes(input.UserInputType);
                    const matchesContext = binding.context === undefined || binding.context === this.currentContext;

                    if (matchesContext && (matchesKey || matchesInputType)) {
                        binding.callback(input, gameProcessed);
                        if (binding.consumeInput) return;
                    }
                }
            }
        });
    }

    public static getInstance(): InputManager {
        return this.instance;
    }

    public bindAction(binding: InputActionBinding): void {
        if (!this.bindings.has(binding.name)) {
            this.bindings.set(binding.name, []);
        }
        this.bindings.get(binding.name)?.push(binding);
    }

    public unbindAction(bindingName: string): void {
        this.bindings.delete(bindingName);
    }

    public setContext(context: string): void {
        this.currentContext = context;
    }

    public clearAll(): void {
        this.bindings.clear();
    }
}
