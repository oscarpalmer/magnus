import type {Context, StoredController} from '../models';
import {createActions} from '../store/action.store';
import {contexts} from '../store/context.store';
import {createData} from '../store/data.store';
import {createTargets} from '../store/target.store';
import {createEvents} from './events';

// #region Instances

function Context(
	this: any,
	name: string,
	element: Element,
	controller: StoredController,
): void {
	this.state = {element, name};

	this.actions = createActions();
	this.data = createData(this, controller.types);
	this.events = createEvents(this);
	this.targets = createTargets(this);

	contexts.connect(element, this);

	this.controller = new controller.ctor(this);

	this.controller.connect?.();
}

// #endregion

// #region Functions

export function createContext(
	name: string,
	element: Element,
	controller: StoredController,
): Context {
	// @ts-expect-error All good, no worries :-)
	return new Context(name, element, controller);
}

// #endregion
