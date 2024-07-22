export type Targets = {
	add(name: string, element: Element): void;
	clear(): void;
	get(name: string): Element[];
	remove(name: string, element: Element): void;
};

export function createTargets(): Targets {
	const store = new Map<string, Set<Element>>();

	const instance = Object.create({
		add(name, element) {
			let targets = store.get(name);

			if (targets == null) {
				targets = new Set();

				store.set(name, targets);
			}

			targets.add(element);
		},
		clear() {
			for (const [, targets] of store) {
				targets.clear();
			}

			store.clear();
		},
		get(name) {
			return [...(store.get(name) ?? [])];
		},
		remove(name, element) {
			store.get(name)?.delete(element);
		},
	} as Targets);

	return instance;
}
