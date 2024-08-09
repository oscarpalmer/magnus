import {isPlainObject} from '@oscarpalmer/atoms/is';
import {dispatch} from '@oscarpalmer/toretto/event';
import type {DispatchOptions} from '@oscarpalmer/toretto/models';
import type {Context} from '../controller/context';
import type {
	ActionParameters,
	DispatchTarget,
	ReadonlyActions,
} from '../models';

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

	get readonly(): ReadonlyActions {
		return {
			dispatch: this.dispatch.bind(this),
		};
	}

	constructor(private readonly context: Context) {}

	add(name: string, target: EventTarget): void {
		const action = this.store.get(name);

		if (action != null && !action.targets.has(target)) {
			action.targets.add(target);

			target.addEventListener(action.type, action.callback, action.options);
		}
	}

	clear(): void {
		const actions = [...this.store.values()];
		const actionsLength = actions.length;

		for (let actionIndex = 0; actionIndex < actionsLength; actionIndex += 1) {
			const action = actions[actionIndex];
			const targets = [...action.targets];
			const targetsLength = targets.length;

			for (let targetIndex = 0; targetIndex < targetsLength; targetIndex += 1) {
				targets[targetIndex].removeEventListener(
					action.type,
					action.callback,
					action.options,
				);
			}

			action.targets.clear();
		}

		this.store.clear();
	}

	create(parameters: ActionParameters): void {
		if (!this.store.has(parameters.name)) {
			this.store.set(parameters.name, new Action(parameters));
		}
	}

	dispatch(
		type: string,
		first?: DispatchTarget | DispatchOptions,
		second?: DispatchTarget,
	): void {
		const firstIsOptions = isPlainObject(first);
		const target = getTarget(this.context, firstIsOptions ? second : first);
		const options = firstIsOptions ? (first as DispatchOptions) : undefined;

		if (target != null) {
			dispatch(target, type, options);
		}
	}

	has(name: string): boolean {
		return this.store.has(name);
	}

	remove(name: string, target: EventTarget): void {
		const action = this.store.get(name);

		if (action != null) {
			target.removeEventListener(action.type, action.callback);

			action.targets.delete(target);

			if (action.targets.size === 0) {
				this.store.delete(name);
			}
		}
	}
}

function getTarget(
	context: Context,
	target?: DispatchTarget,
): EventTarget | undefined {
	if (typeof target === 'string') {
		return context.targets.get(target);
	}

	return target instanceof EventTarget ? target : context.element;
}
