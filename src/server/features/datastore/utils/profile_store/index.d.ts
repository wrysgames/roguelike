/**
 * ProfileStore - Periodic DataStore saving solution with session locking.
 *
 * Features:
 * - Session-based profile locking and saving.
 * - Auto-save and manual save support.
 * - Signals for error, overwrite, and critical state events.
 * - Messaging and global update support.
 * - Mock mode for testing in Studio.
 * - Version querying and rollback support.
 *
 * Usage:
 *   const store = ProfileStore.New("StoreName", { ...template });
 *   const profile = store.StartSessionAsync("playerKey");
 *   profile.Data.x = 123;
 *   profile.Save();
 *   profile.EndSession();
 */

/** Signal type for event connections */
export type ProfileStoreSignal<Args extends unknown[] = []> = {
	Connect(listener: (...args: Args) => void): { Disconnect(): void };
};

/** JSON-acceptable value for profile data */
export type ProfileStoreJSONAcceptable =
	| number
	| string
	| boolean
	| { [key: string]: ProfileStoreJSONAcceptable }
	| Array<ProfileStoreJSONAcceptable>;

/** Profile object returned from ProfileStore */
export interface ProfileStoreProfile<T extends object = defined> {
	Data: T;
	LastSavedData: T;
	FirstSessionTime: number;
	SessionLoadCount: number;
	Session?: { PlaceId: number; JobId: string };
	RobloxMetaData: Record<string, unknown>;
	UserIds: number[];
	KeyInfo: DataStoreKeyInfo;
	OnSave: ProfileStoreSignal<[]>;
	OnLastSave: ProfileStoreSignal<['Manual' | 'External' | 'Shutdown']>;
	OnSessionEnd: ProfileStoreSignal<[]>;
	OnAfterSave: ProfileStoreSignal<[T]>;
	ProfileStore: ProfileStoreModule;
	Key: string;

	IsActive(): boolean;
	Reconcile(): void;
	EndSession(): void;
	AddUserId(userId: number): void;
	RemoveUserId(userId: number): void;
	MessageHandler(fn: (message: ProfileStoreJSONAcceptable, processed: () => void) => void): void;
	Save(): void;
	SetAsync(): void;
}

/** Version query object for profile history */
export interface ProfileStoreVersionQuery<T extends object = defined> {
	NextAsync(): ProfileStoreProfile<T> | undefined;
}

/** Main ProfileStore API */
export interface ProfileStoreModule {
	IsClosing: boolean;
	IsCriticalState: boolean;
	OnError: ProfileStoreSignal<[string, string, string]>;
	OnOverwrite: ProfileStoreSignal<[string, string]>;
	OnCriticalToggle: ProfileStoreSignal<[boolean]>;
	DataStoreState: 'NotReady' | 'NoInternet' | 'NoAccess' | 'Access';

	new <T extends object>(storeName: string, template?: T): ProfileStore<T>;
	New<T extends object>(storeName: string, template?: T): ProfileStore<T>;
	SetConstant(
		name:
			| 'AUTO_SAVE_PERIOD'
			| 'LOAD_REPEAT_PERIOD'
			| 'FIRST_LOAD_REPEAT'
			| 'SESSION_STEAL'
			| 'ASSUME_DEAD'
			| 'START_SESSION_TIMEOUT'
			| 'CRITICAL_STATE_ERROR_COUNT'
			| 'CRITICAL_STATE_ERROR_EXPIRE'
			| 'CRITICAL_STATE_EXPIRE'
			| 'MAX_MESSAGE_QUEUE',
		value: number,
	): void;
}

/** ProfileStore instance */
export interface ProfileStore<T extends object = defined> extends ProfileStoreModule {
	Mock: ProfileStore<T>;

	StartSessionAsync(
		profileKey: string,
		params?: { Steal?: boolean; Cancel?: () => boolean },
	): ProfileStoreProfile<T> | undefined;
	MessageAsync(profileKey: string, message: ProfileStoreJSONAcceptable): boolean;
	GetAsync(profileKey: string, version?: string): ProfileStoreProfile<T> | undefined;
	VersionQuery(
		profileKey: string,
		sortDirection?: Enum.SortDirection,
		minDate?: DateTime | number,
		maxDate?: DateTime | number,
	): ProfileStoreVersionQuery<T>;
	RemoveAsync(profileKey: string): boolean;
}

declare const ProfileStore: ProfileStoreModule;
export default ProfileStore;
