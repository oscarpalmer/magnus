import type {Context, Contexts} from '../models';

// #region Instances

function Contexts(this: any) {
	this.store = new WeakMap<Element, Record<string, Context>>();
}

Contexts.prototype.connect = connectContext;
Contexts.prototype.disconnect = disconnectContext;
Contexts.prototype.get = getContext;

// #endregion

// #region Functions

function connectContext(this: Contexts, element: Element, context: Context): void {
	let connection = this.store.get(element);

	if (connection?.[context.state.name] != null) {
		return;
	}

	if (connection == null) {
		connection = {};

		this.store.set(element, connection);
	}

	connection[context.state.name] = context;
}

function disconnectContext(this: Contexts, element: Element, name?: string): void {
	if (name == null) {
		this.store.delete(element);

		return;
	}

	const connection = this.store.get(element);

	if (connection == null || connection[name] == null) {
		return;
	}

	const names = Object.keys(connection);
	const {length} = names;

	const updated: Record<string, Context> = {};

	for (let index = 0; index < length; index += 1) {
		const key = names[index];

		if (key !== name) {
			updated[key] = connection[key];
		}
	}

	if (length === 1) {
		this.store.delete(element);
	} else {
		this.store.set(element, updated);
	}
}

function getContext(this: Contexts, element: Element, name: string): Context | undefined {
	return this.store.get(element)?.[name];
}

// #endregion

// #region Variables

// @ts-expect-error All good, no worries :-)
export const contexts = new Contexts() as Contexts;

// #endregion
