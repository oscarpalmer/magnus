import type {ControllerConstructor} from './models';
import {observer} from './observer/index';
import {controllers} from './store/controller.store';

export class Magnus {
	/**
	 * Adds a named controller to observe
	 */
	add(name: string, ctor: ControllerConstructor): void {
		if (!controllers.has(name)) {
			controllers.create(name, ctor);

			observer.update();
		}
	}

	/**
	 * Removes a named controller _(and all its instances)_ from observation
	 */
	remove(name: string): void {
		controllers.remove(name);
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

export default magnus;
