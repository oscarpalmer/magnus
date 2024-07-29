import type {Action, Actions} from '../models';

export function createActions() {
	const store = new Map<string, Action>();

	return Object.create({
		add(name, target) {
			const action = store.get(name);

			if (action != null && !action.targets.has(target)) {
				action.targets.add(target);

				target.addEventListener(action.type, action.callback, action.options);
			}
		},
		clear() {
			const actions = [...store.values()];
			const actionsLength = actions.length;

			for (let actionIndex = 0; actionIndex < actionsLength; actionIndex += 1) {
				const action = actions[actionIndex];
				const targets = [...action.targets];
				const targetsLength = targets.length;

				for (
					let targetIndex = 0;
					targetIndex < targetsLength;
					targetIndex += 1
				) {
					targets[targetIndex].removeEventListener(
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
