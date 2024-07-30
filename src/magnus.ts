import type {ControllerConstructor} from './models';
import {observerDocument} from './observer/document.observer';
import {
	controllers,
	createController,
	removeController,
} from './store/controller.store';

export class Magnus {
	add(name: string, ctor: ControllerConstructor): void {
		if (!controllers.has(name)) {
			createController(name, ctor);

			observer.update();
		}
	}

	remove(name: string): void {
		removeController(name);
	}

	start(): void {
		observer.start();
	}

	stop(): void {
		observer.stop();
	}
}

const magnus = new Magnus();
const observer = observerDocument();

export default magnus;
