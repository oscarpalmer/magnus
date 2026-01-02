import type {Context} from '../controller/context';

export class Contexts {
	connect(element: Element, context: Context): void {
		let connection = connections.get(element);

		if (connection?.[context.state.name] != null) {
			return;
		}

		if (connection == null) {
			connection = {};

			connections.set(element, connection);
		}

		connection[context.state.name] = context;
	}

	disconnect(element: Element, name?: string): void {
		if (name == null) {
			connections.delete(element);

			return;
		}

		const connection = connections.get(element);

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
			connections.delete(element);
		} else {
			connections.set(element, updated);
		}
	}

	get(element: Element, name: string): Context | undefined {
		return connections.get(element)?.[name];
	}
}

//

const connections: WeakMap<Element, Record<string, Context>> = new WeakMap();

const contexts: Contexts = new Contexts();

export {contexts};
