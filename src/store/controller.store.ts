import {closest} from '@oscarpalmer/atoms/element';
import {type Context, createContext} from '../controller/context';
import type {ControllerConstructor} from '../controller/controller';

type StoredController = {
	constructor: ControllerConstructor;
	instances: Map<Element, Context>;
};

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
	controller: string,
	identifier?: string,
): Context | undefined {
	let identified: Element | null;

	if (identifier == null) {
		identified = closest(origin, `[data-controller*="${controller}"]`)[0];
	} else {
		identified = document.querySelector(`#${identifier}`);
	}

	return identified == null
		? undefined
		: controllers.get(controller)?.instances.get(identified);
}

export function removeController(name: string, element: Element): void {
	const stored = controllers.get(name);
	const instance = stored?.instances.get(element);

	if (instance != null) {
		stored?.instances.delete(element);

		instance.actions.clear();
		instance.targets.clear();

		instance.controller.disconnected?.();
	}
}
