import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {ControllerDataTypes, ReadonlyTargets} from '../models';
import {replaceData} from '../store/data.store';
import type {Context} from './context';
import type {Events} from './events';

/**
 * Base controller class
 */
export abstract class Controller<Data extends PlainObject = PlainObject> {
	static readonly types: ControllerDataTypes;

	readonly #context: Context;

	/**
	 * Get the controller's data
	 */
	get data(): Data {
		return this.#context.data.value as Data;
	}

	/**
	 * Set the controller's data
	 */
	set data(value: Data | null | undefined) {
		replaceData(this.#context, value);
	}

	/**
	 * The controller's primary element
	 */
	get element(): Element {
		return this.#context.state.element;
	}

	/**
	 * Events helper
	 */
	get events(): Events {
		return this.#context.events;
	}

	/**
	 * Controller name
	 */
	get name(): string {
		return this.#context.state.name;
	}

	/**
	 * The controller's targets
	 */
	get targets(): ReadonlyTargets {
		return this.#context.targets.readonly;
	}

	constructor(context: Context) {
		this.#context = context;
	}

	/**
	 * Called when the controller is connected
	 */
	connect(): void {}

	/**
	 * Called when the controller is disconnected
	 */
	disconnect(): void {}

	/**
	 * Called when a data value has changed
	 */
	valueChanged(name: string, value: unknown): void {}
}
