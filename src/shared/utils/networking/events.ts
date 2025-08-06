import { Networking } from '@flamework/networking';

export interface ClientToServerEvents {
	combat: {
		attack(): void;
		dash(): void;
		equip(instanceId: string): void;
	};
}

export interface ServerToClientEvents {
	// VFX
	vfx: {
		spawnDashParticles(root: Instance, rotation: CFrame, isInAir: boolean): void;
	};
}

// Returns an object containing a `server` and `client` field.
export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
