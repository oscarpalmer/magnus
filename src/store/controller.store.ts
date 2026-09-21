import {findRelatives} from '@oscarpalmer/toretto/find';
import {createContext} from '../controller/context';
import {getDataTypes} from '../helpers/data.helper';
import type {Context, ControllerConstructor, Controllers, StoredController} from '../models';
import {contexts} from './context.store';

// #region Instances

function Controllers(this: any) {
	this.store = new Map<string, StoredController>();
}

Controllers.prototype.add = addController;
Controllers.prototype.create = createController;
Controllers.prototype.find = findController;
Controllers.prototype.has = hasController;
Controllers.prototype.remove = removeController;

function StoredController(this: any, ctor: ControllerConstructor) {
	this.ctor = ctor;
	this.instances = new Map<Element, Context>();
	this.types = getDataTypes((ctor as any).types);
}

// #endregion

// #region Functions

function addController(this: Controllers, name: string, element: Element): void {
	const controller = this.store.get(name);

	if (controller != null && !controller.instances.has(element)) {
		controller.instances.set(element, createContext(name, element, controller));
	}
}

function createController(this: Controllers, name: string, ctor: ControllerConstructor): void {
	this.store.set(name, createStoredController(ctor));
}

export function createStoredController(ctor: ControllerConstructor): StoredController {
	// @ts-expect-error All good, no worries :-)
	return new StoredController(ctor);
}

function findController(
	this: Controllers,
	origin: Element,
	name: string,
	id?: string,
): Context | undefined {
	let found: Element | null;

	if (id == null) {
		found = origin.hasAttribute(`:${name}`) ? origin : findRelatives(origin, `[\\:${name}]`)[0];
	} else {
		found = origin.ownerDocument.querySelector(`#${id}`);
	}

	return found == null ? undefined : this.store.get(name)?.instances.get(found);
}

function hasController(this: Controllers, name: string): boolean {
	return this.store.has(name);
}

function removeController(this: Controllers, name: string): void {
	const controller = this.store.get(name) as StoredController;

	const instances = [...controller.instances.values()];
	const {length} = instances;

	for (let index = 0; index < length; index += 1) {
		removeInstance(controller, instances[index]);
	}

	this.store.delete(name);
}

function removeInstance(controller: StoredController, context: Context): void {
	context.actions.clear();
	context.targets.clear();

	context.controller.disconnect?.();

	controller.instances.delete(context.state.element);

	const elements = [context.state.element, ...context.state.element.querySelectorAll('*')];
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		contexts.disconnect(elements[index], context.state.name);
	}

	context.state.element = undefined as never;
	context.state.name = undefined as never;
}

// #endregion

// #region Variables

// @ts-expect-error All good, no worries :-)
export const controllers = new Controllers() as Controllers;

// #endregion
