import type {ControllerConstructor} from './models';
import {observerDocument} from './observer/document.observer';
import {
	controllers,
	createController,
	removeController,
} from './store/controller.store';

export class Magnus {
	/**
	 * Adds a named controller to observe
	 */
	add(name: string, ctor: ControllerConstructor): void {
		if (!controllers.has(name)) {
			createController(name, ctor);

			observer.update();
		}
	}

	/**
	 * Removes a named controller from observation
	 */
	remove(name: string): void {
		removeController(name);
	}

	/**
	 * Starts the observer
	 */
	start(): void {
		observer.start();
	}

	/**
	 * Stops the observer
	 */
	stop(): void {
		observer.stop();
	}
}

const magnus = new Magnus();
const observer = observerDocument();

export default magnus;
