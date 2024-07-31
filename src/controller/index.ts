import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Context} from './context';

export abstract class Controller<Data extends PlainObject = PlainObject> {
	/**
	 * The controller's primary element
	 */
	get element(): Element {
		return this.context.element;
	}

	/**
	 * Controller data
	 */
	get data(): Data {
		return this.context.data.value as Data;
	}

	/**
	 * Controller name
	 */
	get name(): string {
		return this.context.name;
	}

	constructor(protected readonly context: Context) {}

	/**
	 * Called when the controller is connected
	 */
	abstract connected(): void;

	/**
	 * Called when the controller is disconnected
	 */
	abstract disconnected(): void;
}
