import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Context} from '../models';

export abstract class Controller<Model extends PlainObject = PlainObject> {
	get element(): Element {
		return this.context.element;
	}

	get data(): Model {
		return this.context.data.value as Model;
	}

	get name(): string {
		return this.context.name;
	}

	constructor(protected readonly context: Context) {}

	abstract connected(): void;

	abstract disconnected(): void;
}
