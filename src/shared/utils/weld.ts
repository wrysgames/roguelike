import { getDescendantsOfType } from './instance';

export function weldModelToPart(model: Instance, part: BasePart): WeldConstraint[] {
	const welds: WeldConstraint[] = [];
	const descendants = getDescendantsOfType(model, 'BasePart');
	for (const descendant of descendants) {
		const weld = new Instance('WeldConstraint');
		weld.Part0 = descendant;
		weld.Part1 = part;
		weld.Parent = part;
		welds.push(weld);
	}
	return welds;
}
