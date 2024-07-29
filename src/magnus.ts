import type {ControllerConstructor} from './models';
import {createObserver} from './observer';
import {
	controllers,
	createController,
	removeController,
} from './store/controller.store';

type Magnus = {
	add(name: string, ctor: ControllerConstructor): void;
	remove(name: string): void;
	start(): void;
	stop(): void;
};

function createMagnus(): Magnus {
	const observer = createObserver();

	const instance = Object.create({
		add(name: string, ctor: ControllerConstructor): void {
			if (controllers.has(name)) {
				throw new Error(`Controller '${name}' already exists`);
			}

			createController(name, ctor);

			observer.update();
		},
		remove(name: string): void {
			removeController(name);
		},
		start() {
			observer.start();
		},
		stop() {
			observer.stop();
		},
	});

	return instance;
}

export default createMagnus();
