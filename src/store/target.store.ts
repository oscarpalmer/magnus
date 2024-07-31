export class Targets {
	private readonly store = new Map<string, Set<Element>>();

	add(name: string, element: Element): void {
		let targets = this.store.get(name);

		if (targets == null) {
			targets = new Set();

			this.store.set(name, targets);
		}

		targets.add(element);
	}

	clear(): void {
		const targets = [...this.store.values()];
		const {length} = targets;

		for (let index = 0; index < length; index += 1) {
			targets[index].clear();
		}

		this.store.clear();
	}

	get(name: string): Element[];

	get(name: string, single: true): Element | undefined;

	get(name: string, single?: boolean): Element | Element[] | undefined {
		const targets = [...(this.store.get(name) ?? [])];

		return single === true ? targets[0] : targets;
	}

	remove(name: string, element: Element): void {
		this.store.get(name)?.delete(element);
	}
}
