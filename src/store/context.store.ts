import type {Context, Contexts} from '../models';

// #region Instances

function Contexts(this: any): void {
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

	if (connection?.[name] == null) {
		return;
	}

	delete connection[name];

	if (Object.keys(connection).length === 0) {
		this.store.delete(element);
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
