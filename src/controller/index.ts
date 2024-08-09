import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {ReadonlyActions, ReadonlyTargets} from '../models';
import {replaceData} from '../store/data.store';
import type {Context} from './context';

export abstract class Controller<Data extends PlainObject = PlainObject> {
	/**
	 * The controller's actions
	 */
	get actions(): ReadonlyActions {
		return this.context.actions.readonly;
	}

	/**
	 * The controller's primary element
	 */
	get element(): Element {
		return this.context.element;
	}

	/**
	 * Get the controller's data
	 */
	get data(): Data {
		return this.context.data.value as Data;
	}

	/**
	 * Set the controller's data
	 */
	set data(value: Data | null | undefined) {
		replaceData(this.context, value);
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
	get targets(): ReadonlyTargets {
		return this.context.targets.readonly;
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
