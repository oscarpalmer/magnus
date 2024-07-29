import type {Targets} from '../models';

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
			const targets = [...store.values()];
			const {length} = targets;

			for (let index = 0; index < length; index += 1) {
				targets[index].clear();
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
