import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Context} from './context';

export const attribute = 'data-controller';

export type ControllerConstructor = new (context: Context) => Controller;

export abstract class Controller<Model extends PlainObject = PlainObject> {
	get element(): Element {
		return this.context.element;
	}

	get data(): Model {
		return this.context.data.value as Model;
	}

	get identifier(): string {
		return this.context.identifier;
	}

	constructor(protected readonly context: Context) {}

	abstract connected(): void;

	abstract disconnected(): void;
}
