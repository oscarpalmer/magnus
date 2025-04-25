import {findRelatives} from '@oscarpalmer/toretto/find';
import {Context} from '../controller/context';
import type {ControllerConstructor} from '../models';

const stored = new Map<string, StoredController>();

class Controllers {
	add(name: string, element: Element): void {
		const controller = stored.get(name);

		if (controller != null && !controller.instances.has(element)) {
			controller.instances.set(
				element,
				new Context(name, element, controller.ctor),
			);
		}
	}

	create(name: string, ctor: ControllerConstructor): void {
		stored.set(name, new StoredController(ctor));
	}

	find(origin: Element, name: string, id?: string): Context | undefined {
		let found: Element | null;

		if (id == null) {
			found = findRelatives(origin, `[\\:${name}]`)[0];
		} else {
			found = origin.ownerDocument.querySelector(`#${id}`);
		}

		if (found != null) {
			return stored.get(name)?.instances.get(found);
		}
	}

	has(name: string): boolean {
		return stored.has(name);
	}

	remove(name: string, element?: Element): void {
		const controller = stored.get(name) as StoredController;

		if (element == null) {
			const instances = [...controller.instances.values()];
			const {length} = instances;

			for (let index = 0; index < length; index += 1) {
				this.removeInstance(controller, instances[index]);
			}

			controller.instances.clear();

			stored.delete(name);
		} else {
			this.removeInstance(controller, controller.instances.get(element));
		}
	}

	private removeInstance(
		controller: StoredController,
		context?: Context,
	): void {
		context?.actions.clear();
		context?.targets.clear();

		context?.controller.disconnect?.();

		controller?.instances.delete(context?.state.element as never);

		if (context != null) {
			context.state.element = undefined as never;
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
