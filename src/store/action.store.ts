import {on} from '@oscarpalmer/toretto/event';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import type {Action, ActionListeners, ActionParameters, Actions} from '../models';

// #region Instances

function Action(this: any, actions: Actions, parameters: ActionParameters) {
	this.actions = actions;
	this.callback = parameters.callback;
	this.options = parameters.options;
	this.listeners = new Map<EventTarget, ActionListeners>();
	this.name = parameters.name;
	this.type = parameters.type;
}

Action.prototype.add = addAction;
Action.prototype.clear = clearAction;
Action.prototype.remove = removeAction;

function Actions(this: any): void {
	this.store = new Map<string, Action>();
}

Actions.prototype.add = addToActions;
Actions.prototype.clear = clearActions;
Actions.prototype.create = createAction;
Actions.prototype.has = hasAction;
Actions.prototype.remove = removeFromActions;

// #endregion

// #region Functions

function addAction(this: Action, target: EventTarget, origin: EventTarget): void {
	let listeners = this.listeners.get(target);

	if (listeners == null) {
		listeners = {
			origins: new Set(),
			remove: getRemovableListener(this, target),
		};

		this.listeners.set(target, listeners);
	}

	listeners.origins.add(origin);
}

function addToActions(this: Actions, name: string, target: EventTarget, origin: EventTarget): void {
	const action = this.store.get(name);

	if (action != null) {
		action.add(target, origin);
	}
}

function clearAction(this: Action): void {
	for (const listener of this.listeners.values()) {
		listener.remove();
	}

	this.listeners.clear();
}

function clearActions(this: Actions): void {
	for (const action of this.store.values()) {
		action.clear();
	}

	this.store.clear();
}

function createAction(
	this: Actions,
	parameters: ActionParameters,
	target: EventTarget,
	origin: EventTarget,
): void {
	if (!this.store.has(parameters.name)) {
		// @ts-expect-error All good, no worries :-)
		const action = new Action(this, parameters);

		action.add(target, origin);

		this.store.set(parameters.name, action);
	}
}

export function createActions(): Actions {
	// @ts-expect-error All good, no worries :-)
	return new Actions();
}

function getRemovableListener(action: Action, target: EventTarget): RemovableEventListener {
	const listener = on(
		target,
		action.type,
		(event: Event) => {
			if (action.options.once) {
				removeListener(action, target, listener);
			}

			action.callback(event);
		},
		{
			...action.options,
			once: false,
		},
	);

	return listener;
}

function hasAction(this: Actions, name: string): boolean {
	return this.store.has(name);
}

function removeAction(this: Action, origin: EventTarget): void {
	for (const [target, listener] of this.listeners) {
		listener.origins.delete(origin);

		if (listener.origins.size === 0) {
			removeListener(this, target, listener.remove);
		}
	}
}

function removeFromActions(this: Actions, name: string, origin: EventTarget): void {
	this.store.get(name)?.remove(origin);
}

function removeListener(action: Action, target: EventTarget, remove: RemovableEventListener): void {
	remove();

	action.listeners.delete(target);

	if (action.listeners.size === 0) {
		action.actions.store.delete(action.name);
	}
}

// #endregion
