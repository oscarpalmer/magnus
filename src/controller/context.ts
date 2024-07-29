import type {Context, ControllerConstructor} from '../models';
import {handleAttributes} from '../observer/attributes';
import {observeController} from '../observer/controller.observer';
import {createActions} from '../store/action.store';
import {createData} from '../store/data.store';
import {createTargets} from '../store/target.store';

export function createContext(
	name: string,
	element: Element,
	ctor: ControllerConstructor,
): Context {
	const context = Object.create(null);

	Object.defineProperties(context, {
		actions: {
			value: createActions(),
		},
		data: {
			value: createData(name, context),
		},
		element: {
			value: element,
		},
		name: {
			value: name,
		},
		observer: {
			value: observeController(name, element),
		},
		targets: {
			value: createTargets(),
		},
	});

	const controller = new ctor(context);

	Object.defineProperties(context, {
		controller: {
			value: controller,
		},
	});

	handleAttributes(context);

	controller.connected?.();

	return context;
}
