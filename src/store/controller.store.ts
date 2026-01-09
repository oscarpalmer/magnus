import {findRelatives} from '@oscarpalmer/toretto/find';
import {Context} from '../controller/context';
import {getDataTypes} from '../helpers/data.helper';
import type {ControllerConstructor, DataTypes} from '../models';
import {contexts} from './context.store';

class Controllers {
	private readonly store = new Map<string, StoredController>();

	add(name: string, element: Element): void {
		const controller = this.store.get(name);

		if (controller != null && !controller.instances.has(element)) {
			controller.instances.set(element, new Context(name, element, controller));
		}
	}

	create(name: string, ctor: ControllerConstructor): void {
		this.store.set(name, new StoredController(ctor));
	}

	find(origin: Element, name: string, id?: string): Context | undefined {
		let found: Element | null;

		if (id == null) {
			found = origin.hasAttribute(`:${name}`) ? origin : findRelatives(origin, `[\\:${name}]`)[0];
		} else {
			found = origin.ownerDocument.querySelector(`#${id}`);
		}

		if (found != null) {
			return this.store.get(name)?.instances.get(found);
		}
	}

	has(name: string): boolean {
		return this.store.has(name);
	}

	remove(name: string, element?: Element): void {
		const controller = this.store.get(name) as StoredController;

		if (element == null) {
			const instances = [...controller.instances.values()];
			const {length} = instances;

			for (let index = 0; index < length; index += 1) {
				removeInstance(controller, instances[index]);
			}

			this.store.delete(name);
		} else {
			removeInstance(controller, controller.instances.get(element)!);
		}
	}
}

export class StoredController {
	readonly instances = new Map<Element, Context>();

	readonly types: DataTypes;

	constructor(readonly ctor: ControllerConstructor) {
		this.types = getDataTypes((ctor as any).types);
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

export const controllers = new Controllers();
