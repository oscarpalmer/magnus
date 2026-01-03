import type {Context} from '../controller/context';
import type {ReadonlyTargets} from '../models';

export class Targets {
	readonly #callbacks: ReadonlyTargets | undefined;
	readonly #store = new Map<string, Set<Element>>();

	get readonly(): ReadonlyTargets {
		return this.#callbacks as ReadonlyTargets;
	}

	constructor(private readonly context: Context) {
		this.#callbacks = Object.freeze({
			find: this.find.bind(this) as never,
			findAll: this.findAll.bind(this) as never,
			get: this.get.bind(this) as never,
			getAll: this.getAll.bind(this) as never,
			has: this.has.bind(this),
		});
	}

	add(name: string, element: Element): void {
		let targets = this.#store.get(name);

		if (targets == null) {
			targets = new Set();

			this.#store.set(name, targets);
		}

		targets.add(element);
	}

	clear(): void {
		const targets = [...this.#store.values()];
		const {length} = targets;

		for (let index = 0; index < length; index += 1) {
			targets[index].clear();
		}

		this.#store.clear();
	}

	find(selector: string): Element | null {
		return this.context.state.element.querySelector(selector);
	}

	findAll(selector: string): Element[] {
		return [...this.context.state.element.querySelectorAll(selector)];
	}

	get(name: string): Element | undefined {
		return this.getAll(name)[0];
	}

	getAll(name: string): Element[] {
		return [...(this.#store.get(name) ?? [])];
	}

	has(name: string): boolean {
		return (this.#store.get(name)?.size ?? 0) > 0;
	}

	remove(name: string, element: Element): void {
		this.#store.get(name)?.delete(element);
	}
}
