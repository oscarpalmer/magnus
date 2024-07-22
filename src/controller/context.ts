import {handleAttributes} from '../observer/attributes';
import {observeController} from '../observer/controller.observer';
import type {Observer} from '../observer/observer';
import {type Actions, createActions} from '../store/action.store';
import {type Data, createData} from '../store/data.store';
import {type Targets, createTargets} from '../store/target.store';
import type {Controller, ControllerConstructor} from './controller';

export type Context = {
	readonly actions: Actions;
	readonly controller: Controller;
	readonly data: Data;
	readonly element: Element;
	readonly identifier: string;
	readonly observer: Observer;
	readonly targets: Targets;
};

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
		identifier: {
			value: name,
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
		observer: {
			value: observeController(context),
		},
	});

	handleAttributes(context);

	controller.connected?.();

	return context;
}
