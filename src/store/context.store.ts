import type {Context} from '../controller/context';

export class Contexts {
	private readonly store = new WeakMap<Element, Record<string, Context>>();

	connect(element: Element, context: Context): void {
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

	disconnect(element: Element, name?: string): void {
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

	get(element: Element, name: string): Context | undefined {
		return this.store.get(element)?.[name];
	}
}

//

export const contexts = new Contexts();
