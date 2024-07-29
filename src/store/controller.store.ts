import {closest} from '@oscarpalmer/atoms/element';
import {createContext} from '../controller/context';
import type {Context, ControllerConstructor, StoredController} from '../models';

export const controllers = new Map<string, StoredController>();

export function addController(name: string, element: Element): void {
	const controller = controllers.get(name);

	if (controller != null && !controller.instances.has(element)) {
		controller.instances.set(
			element,
			createContext(name, element, controller.constructor),
		);
	}
}

export function createController(
	name: string,
	ctor: ControllerConstructor,
): void {
	if (!controllers.has(name)) {
		controllers.set(name, {
			constructor: ctor,
			instances: new Map(),
		});
	}
}

export function findContext(
	origin: Element,
	name: string,
	id?: string,
): Context | undefined {
	let found: Element | null;

	if (id == null) {
		found = closest(origin, `[data-controller*="${name}"]`)[0];
	} else {
		found = document.querySelector(`#${id}`);
	}

	return found == null
		? undefined
		: controllers.get(name)?.instances.get(found);
}

export function removeController(name: string, element?: Element): void {
	const stored = controllers.get(name);

	if (stored == null) {
		return;
	}

	if (element == null) {
		const instances = [...stored.instances.values()];
		const {length} = instances;

		for (let index = 0; index < length; index += 1) {
			removeInstance(stored, instances[index]);
		}
	} else {
		removeInstance(stored, stored.instances.get(element));
	}
}

function removeInstance(controller: StoredController, context?: Context): void {
	if (context != null) {
		context.observer.stop();

		context.actions.clear();
		context.targets.clear();

		context.controller.disconnected?.();

		controller?.instances.delete(context.element);
	}
}
