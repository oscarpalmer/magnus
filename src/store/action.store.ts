import {off, on} from '@oscarpalmer/toretto/event';
import type {ActionParameters} from '../models';

export class Action {
	readonly callback: (event: Event) => void;

	readonly options: AddEventListenerOptions;

	readonly targets = new Set<EventTarget>();

	readonly type: string;

	constructor(parameters: ActionParameters) {
		this.callback = parameters.callback;
		this.options = parameters.options;
		this.type = parameters.type;
	}
}

export class Actions {
	private readonly store = new Map<string, Action>();

	add(name: string, target: EventTarget): void {
		const action = this.store.get(name);

		if (action != null) {
			addActionTarget(action, target);
		}
	}

	clear(): void {
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

	create(parameters: ActionParameters, target: EventTarget): void {
		if (!this.store.has(parameters.name)) {
			const action = new Action(parameters);

			addActionTarget(action, target);

			this.store.set(parameters.name, action);
		}
	}

	has(name: string): boolean {
		return this.store.has(name);
	}

	remove(name: string, target: EventTarget): void {
		const action = this.store.get(name);

		if (action != null) {
			removeActionTarget(this.store, name, action, target);
		}
	}
}

function addActionTarget(action: Action, target: EventTarget): void {
	if (!action.targets.has(target)) {
		action.targets.add(target);

		on(target, action.type, action.callback, action.options);
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
