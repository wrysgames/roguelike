import { BaseItem, BaseUpgrade, InferStats, InferTags } from '../types';

export class ItemBuilder<T extends BaseItem<InferStats<T>, InferTags<T>>> {
	protected item: Partial<T> = {};

	constructor(id: T['id'], name: T['name'], itemType: T['type'], rarity: T['rarity']) {
		this.item.id = `${itemType}:${id}`;
		this.item.name = name;
		this.item.type = itemType;
		this.item.rarity = rarity;
		this.item.maxLevel = 50;
		this.item.maxTiers = 5;
	}

	public obtainableInDrop(): this {
		this.item.obtainable ??= {};
		this.item.obtainable.drops = true;
		return this;
	}

	public withMaxTiers(maxTiers: number): this {
		this.item.maxTiers = maxTiers;
		return this;
	}

	public withMaxLevels(maxLevel: number): this {
		this.item.maxLevel = maxLevel;
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

	public withUpgrade(upgrade: BaseUpgrade<InferStats<T>>): this {
		this.item.upgrades ??= [];
		this.item.upgrades.push(upgrade);
		return this;
	}

	public validate(): asserts this is { item: T } {
		const requiredFields = ['id', 'name', 'type', 'baseStats', 'rarity'] as const;

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

	build(): Readonly<T> {
		this.validate();
		return this.item;
	}
}
