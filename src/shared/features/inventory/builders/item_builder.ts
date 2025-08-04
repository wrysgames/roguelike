import { BaseItem, BaseUpgrade } from '../types';

type InferStats<T> = T extends BaseItem<infer S, defined> ? S : never;
type InferTags<T> = T extends BaseItem<defined, infer R> ? R : never;

export class ItemBuilder<T extends BaseItem<InferStats<T>, InferTags<T>>> {
	protected item: Partial<T> = {};

	constructor(id: string, name: string, itemType: string) {
		this.item.id = `${itemType}:${id}`;
		this.item.name = name;
		this.item.type = itemType;
	}

	public obtainableInDrop(): this {
		this.item.obtainable ??= {};
		this.item.obtainable.drops = true;
		return this;
	}

	public withTags(...tags: InferTags<T>[]): this {
		this.item.tags = tags;
		return this;
	}

	public withStats(stats: InferStats<T>): this {
		this.item.baseStats = stats;
		return this;
	}

	withUpgrade(upgrade: BaseUpgrade<InferStats<T>>) {
		this.item.upgrades ??= [];
		this.item.upgrades.push(upgrade);
	}

	validate(): asserts this is { item: T } {
		const requiredFields = ['id', 'name', 'type', 'baseStats'] as const;

		for (const field of requiredFields) {
			if (this.item[field] === undefined) {
				throw `Missing required field: ${field}`;
			}
		}

		// optional: validate tags are not empty array
		if (this.item.tags && this.item.tags.size() === 0) {
			throw 'Tags list is empty — either omit it or provide at least one tag.';
		}
	}

	build(): T {
		return this.item as T;
	}
}
