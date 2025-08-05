import Object from '@rbxts/object-utils';

export function getDescendantsOfType<T extends keyof Objects>(root: Instance, instanceType: T): Objects[T][] {
	return root.GetDescendants().filter((instance) => instance.IsA(instanceType));
}

export function getChildrenOfType<T extends keyof Objects>(root: Instance, instanceType: T): Objects[T][] {
	return root.GetChildren().filter((instance) => instance.IsA(instanceType));
}

export function deepClone<T>(obj: T): T {
	if (typeIs(obj, 'table')) {
		const result = {} as T;
		for (const [key, value] of Object.entries(obj) as [keyof T, unknown][]) {
			result[key] = deepClone(value) as T[keyof T];
		}
		return result;
	}
	return obj;
}
