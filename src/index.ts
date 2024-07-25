import type {ControllerConstructor} from './controller/controller';
import {createObserver} from './observer/observer';
import {controllers, createController} from './store/controller.store';

const observer = createObserver();

export function add(name: string, ctor: ControllerConstructor): void {
	if (controllers.has(name)) {
		throw new Error(`Controller '${name}' already exists`);
	}

	createController(name, ctor);

	observer.update();
}

export {Controller} from './controller/controller';

