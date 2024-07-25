type Action = {
	callback: (event: Event) => void;
	options: AddEventListenerOptions;
	targets: Set<EventTarget>;
	type: string;
};

export type Actions = {
		add(name: string, target: EventTarget): void;
		clear(): void;
		create(parameters: Parameters): void;
		has(name: string): boolean;
		remove(name: string, target: EventTarget): void;
	};

type Parameters = {
	callback: (event: Event) => void;
	name: string;
	options: AddEventListenerOptions;
	type: string;
};

export function createActions() {
	const store = new Map<string, Action>();

	return Object.create({
		add(name, target) {
			const action = store.get(name);

			if (action != null) {
				action.targets.add(target);

				target.addEventListener(action.type, action.callback, action.options);
			}
		},
		clear() {
			for (const [, action] of store) {
				for (const target of action.targets) {
					target.removeEventListener(
						action.type,
						action.callback,
						action.options,
					);
				}

				action.targets.clear();
			}

			store.clear();
		},
		create(parameters) {
			if (!store.has(parameters.name)) {
				store.set(parameters.name, {
					callback: parameters.callback,
					options: parameters.options,
					targets: new Set(),
					type: parameters.type,
				});
			}
		},
		has(name) {
			return store.has(name);
		},
		remove(name, target) {
			const action = store.get(name);

			if (action != null) {
				target.removeEventListener(action.type, action.callback);

				action.targets.delete(target);

				if (action.targets.size === 0) {
					store.delete(name);
				}
			}
		},
	} as Actions);
}
