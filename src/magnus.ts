import type {ControllerConstructor} from './models';
import observer from './observer/index';
import {controllers} from './store/controller.store';

export class Magnus {
		/**
		 * Is Magnus active?
		 */
		get active(): boolean {
			return active;
		}

		/**
		 * Adds a named controller to observe
		 */
		add(name: string, ctor: ControllerConstructor): void {
			if (!controllers.has(name)) {
				controllers.create(name, ctor);

				if (active) {
					observer.update();
				}
			}
		}

		/**
		 * Removes a named controller _(and all its instances)_ from observation
		 */
		remove(name: string): void {
			if (controllers.has(name)) {
				controllers.remove(name);
			}
		}

		/**
		 * Starts the observer
		 */
		start(): void {
			if (!active) {
				active = true;

				observer.start();
			}
		}

		/**
		 * Stops the observer
		 */
		stop(): void {
			if (active) {
				active = false;

				observer.stop();
			}
		}
	}

const magnus = new Magnus();

let active = true;

export default magnus;
