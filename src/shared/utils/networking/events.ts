import { Networking } from '@flamework/networking';

export interface ClientToServerEvents {
	attack(): void;
	dash(): void;
}

export interface ServerToClientEvents {
	// VFX
	idk(): void;
}

// Returns an object containing a `server` and `client` field.
export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
