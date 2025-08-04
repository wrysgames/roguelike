import { OnStart, Service } from '@flamework/core';

@Service()
export class CombatService implements OnStart {
    public onStart(): void {
        print('Hello from CombatService!');
    }
}
