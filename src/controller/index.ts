import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {GetTargets} from '../models';
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

	/**
	 * The controller's targets
	 */
	get targets(): GetTargets {
		return this.context.targets.getters;
	}

	constructor(protected readonly context: Context) {}

	/**
	 * Called when the controller is connected
	 */
	abstract connect(): void;

	/**
	 * Called when the controller is disconnected
	 */
	abstract disconnect(): void;
}
