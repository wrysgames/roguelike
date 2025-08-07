export type DeepReadonly<T> = T extends (...args: defined[]) => defined
	? T
	: T extends Array<infer U>
		? ReadonlyArray<DeepReadonly<U>>
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;
