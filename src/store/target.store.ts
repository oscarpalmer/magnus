import type {GetTargets} from '../models';

export class Targets {
	private readonly callbacks: GetTargets;
	private readonly store = new Map<string, Set<Element>>();

	get getters(): GetTargets {
		return {...this.callbacks};
	}

	constructor(element: Element) {
		this.callbacks = {
			find: (selector: string) =>
				[...element.querySelectorAll(selector)] as never,
			get: this.get.bind(this),
			getAll: this.getAll.bind(this),
			has: this.has.bind(this),
		};
	}

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

	get<Target extends Element = Element>(name: string): Target | undefined {
		return this.getAll(name)[0] as Target | undefined;
	}

	getAll<Target extends Element = Element>(name: string): Target[] {
		return [...(this.store.get(name) ?? [])] as Target[];
	}

	has(name: string): boolean {
		return (this.store.get(name)?.size ?? 0) > 0;
	}

	remove(name: string, element: Element): void {
		this.store.get(name)?.delete(element);
	}
}
