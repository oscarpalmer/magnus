import {findRelatives} from '@oscarpalmer/toretto/find';
import {Context} from '../controller/context';
import type {ControllerConstructor} from '../models';

class Controllers {
	private readonly stored = new Map<string, StoredController>();

	add(name: string, element: Element): void {
		const controller = this.stored.get(name);

		if (controller != null && !controller.instances.has(element)) {
			controller.instances.set(
				element,
				new Context(name, element, controller.ctor),
			);
		}
	}

	create(name: string, ctor: ControllerConstructor): void {
		if (!this.stored.has(name)) {
			this.stored.set(name, new StoredController(ctor));
		}
	}

	find(origin: Element, name: string, id?: string): Context | undefined {
		let found: Element | null;

		if (id == null) {
			found = findRelatives(origin, `[data-controller~="${name}"]`)[0];
		} else {
			found = document.querySelector(`#${id}`);
		}

		return found == null
			? undefined
			: this.stored.get(name)?.instances.get(found);
	}

	has(name: string): boolean {
		return this.stored.has(name);
	}

	remove(name: string, element?: Element): void {
		const stored = this.stored.get(name);

		if (stored == null) {
			return;
		}

		if (element == null) {
			const instances = [...stored.instances.values()];
			const {length} = instances;

			for (let index = 0; index < length; index += 1) {
				this.removeInstance(stored, instances[index]);
			}

			stored.instances.clear();
			this.stored.delete(name);
		} else {
			this.removeInstance(stored, stored.instances.get(element));
		}
	}

	private removeInstance(
		controller: StoredController,
		context?: Context,
	): void {
		if (context != null) {
			context.observer.stop();

			context.actions.clear();
			context.targets.clear();

			context.controller.disconnect?.();

			controller?.instances.delete(context.element);
		}
	}
}

export class StoredController {
	readonly ctor: ControllerConstructor;
	readonly instances = new Map<Element, Context>();

	constructor(ctor: ControllerConstructor) {
		this.ctor = ctor;
	}
}

export const controllers = new Controllers();
