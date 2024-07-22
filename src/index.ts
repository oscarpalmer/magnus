import type {ControllerConstructor} from './controller/controller';
import {observeDocument} from './observer/document.observer';
import {controllers, createController} from './store/controller.store';

const documentObserver = observeDocument();

export function add(name: string, ctor: ControllerConstructor): void {
	if (controllers.has(name)) {
		throw new Error(`Controller '${name}' already exists`);
	}

	createController(name, ctor);

	documentObserver.update();
}

export {Controller} from './controller/controller';

