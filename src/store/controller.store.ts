import {findRelatives} from '@oscarpalmer/toretto/find';
import {Context} from '../controller/context';
import type {ControllerConstructor} from '../models';
import {contexts} from './context.store';

class Controllers {
	add(name: string, element: Element): void {
		const controller = stored.get(name);

		if (controller != null && !controller.instances.has(element)) {
			controller.instances.set(element, new Context(name, element, controller.ctor));
		}
	}

	create(name: string, ctor: ControllerConstructor): void {
		stored.set(name, new StoredController(ctor));
	}

	find(origin: Element, name: string, id?: string): Context | undefined {
		let found: Element | null;

		if (id == null) {
			found = origin.hasAttribute(`:${name}`) ? origin : findRelatives(origin, `[\\:${name}]`)[0];
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
				removeInstance(controller, instances[index]);
			}

			stored.delete(name);
		} else {
			removeInstance(controller, controller.instances.get(element)!);
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

//

function removeInstance(controller: StoredController, context: Context): void {
	context?.actions.clear();
	context?.targets.clear();

	context?.controller.disconnect?.();

	controller.instances.delete(context?.state.element as never);

	const elements = [context.state.element, ...context.state.element.querySelectorAll('*')];
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		contexts.disconnect(elements[index], context.state.name);
	}

	context.state.element = undefined as never;
	context.state.name = undefined as never;
}

//

export const controllers: Controllers = new Controllers();

const stored: Map<string, StoredController> = new Map();
