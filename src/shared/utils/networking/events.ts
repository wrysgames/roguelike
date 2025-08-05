import { Networking } from '@flamework/networking';

export interface ClientToServerEvents {
	combat: {
		attack(): void;
		dash(): void;
	};
}

export interface ServerToClientEvents {
	// VFX
	vfx: {};
}

// Returns an object containing a `server` and `client` field.
export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
