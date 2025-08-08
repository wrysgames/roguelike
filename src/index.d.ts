declare global {
	interface ReplicatedStorage {
		weapons: Folder;
		vfx: Folder & {
			combat: Folder;
		};
	}
}

export {};
