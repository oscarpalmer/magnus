import {off, on} from '@oscarpalmer/toretto/event';
import type {Action, ActionParameters, Actions} from '../models';

// #region Instances

function Action(this: any, parameters: ActionParameters) {
	this.callback = parameters.callback;
	this.options = parameters.options;
	this.targets = new Set<EventTarget>();
	this.type = parameters.type;
}

function Actions(this: any) {
	this.store = new Map<string, Action>();
}

Actions.prototype.add = addAction;
Actions.prototype.clear = clearActions;
Actions.prototype.create = createAction;
Actions.prototype.has = hasAction;
Actions.prototype.remove = removeAction;

// #endregion

// #region Functions

function addAction(this: Actions, name: string, target: EventTarget): void {
	const action = this.store.get(name);

	if (action != null) {
		addActionTarget(action, target);
	}
}

function addActionTarget(action: Action, target: EventTarget): void {
	if (!action.targets.has(target)) {
		action.targets.add(target);

		on(target, action.type, action.callback, action.options);
	}
}

function clearActions(this: Actions): void {
	const actions = [...this.store.values()];
	const {length} = actions;

	for (let index = 0; index < length; index += 1) {
		const action = actions[index];

		for (const target of action.targets) {
			off(target, action.type, action.callback, action.options);
		}
	}

	this.store.clear();
}

function createAction(this: Actions, parameters: ActionParameters, target: EventTarget): void {
	if (!this.store.has(parameters.name)) {
		// @ts-expect-error All good, no worries :-)
		const action = new Action(parameters);

		addActionTarget(action, target);

		this.store.set(parameters.name, action);
	}
}

export function createActions(): Actions {
	// @ts-expect-error All good, no worries :-)
	return new Actions();
}

function hasAction(this: Actions, name: string): boolean {
	return this.store.has(name);
}

function removeAction(this: Actions, name: string, target: EventTarget): void {
	const action = this.store.get(name);

	if (action != null) {
		removeActionTarget(this.store, name, action, target);
	}
}

function removeActionTarget(
	store: Map<string, Action>,
	name: string,
	action: Action,
	target: EventTarget,
): void {
	off(target, action.type, action.callback, action.options);

	action.targets.delete(target);

	if (action.targets.size === 0) {
		store.delete(name);
	}
}

// #endregion
