import type {ControllerConstructor, Magnus} from './models';
import {observer} from './observer/index';
import {controllers} from './store/controller.store';

// #region Instances

function Magnus(this: Magnus): void {
	//
}

Magnus.prototype.add = addController;
Magnus.prototype.remove = removeController;
Magnus.prototype.start = startMagnus;
Magnus.prototype.stop = stopMagnus;

Object.defineProperty(Magnus.prototype, 'active', {
	get: getActive,
});

// #endregion

// #region Functions

function addController(this: Magnus, name: string, ctor: ControllerConstructor): void {
	if (!controllers.has(name)) {
		controllers.create(name, ctor);

		if (active) {
			observer.update();
		}
	}
}

function getActive(this: Magnus): boolean {
	return active;
}

function removeController(this: Magnus, name: string): void {
	if (controllers.has(name)) {
		controllers.remove(name);
	}
}

function startMagnus(this: Magnus): void {
	if (!active) {
		active = true;

		observer.start();
	}
}

function stopMagnus(this: Magnus): void {
	if (active) {
		active = false;

		observer.stop();
	}
}

// #endregion

// #region Variables

// @ts-expect-error All good, no worries :-)
export const magnus = new Magnus() as Magnus;

let active = true;

// #endregion
