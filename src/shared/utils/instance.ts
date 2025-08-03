export function getDescendantsOfType<T extends keyof Objects>(root: Instance, instanceType: T): Objects[T][] {
	return root.GetDescendants().filter((instance) => instance.IsA(instanceType));
}

export function getChildrenOfType<T extends keyof Objects>(root: Instance, instanceType: T): Objects[T][] {
	return root.GetChildren().filter((instance) => instance.IsA(instanceType));
}
