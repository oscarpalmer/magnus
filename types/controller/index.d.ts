import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { ReadonlyActions, ReadonlyTargets } from '../models';
import type { Context } from './context';
export declare abstract class Controller<Data extends PlainObject = PlainObject> {
    protected readonly context: Context;
    /**
     * The controller's actions
     */
    get actions(): ReadonlyActions;
    /**
     * The controller's primary element
     */
    get element(): Element;
    /**
     * Get the controller's data
     */
    get data(): Data;
    /**
     * Set the controller's data
     */
    set data(value: Data | null | undefined);
    /**
     * Controller name
     */
    get name(): string;
    /**
     * The controller's targets
     */
    get targets(): ReadonlyTargets;
    constructor(context: Context);
    /**
     * Called when the controller is connected
     */
    abstract connect(): void;
    /**
     * Called when the controller is disconnected
     */
    abstract disconnect(): void;
}
