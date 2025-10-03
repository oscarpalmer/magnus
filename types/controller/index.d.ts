import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { ControllerDataTypes, ReadonlyTargets } from '../models';
import type { Context } from './context';
import type { Events } from './events';
/**
 * Base controller class
 */
export declare abstract class Controller<Data extends PlainObject = PlainObject> {
    static readonly types: ControllerDataTypes;
    protected readonly context: Context;
    /**
     * Get the controller's data
     */
    get data(): Data;
    /**
     * Set the controller's data
     */
    set data(value: Data | null | undefined);
    /**
     * The controller's primary element
     */
    get element(): Element;
    /**
     * Events helper
     */
    get events(): Events;
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
    connect(): void;
    /**
     * Called when the controller is disconnected
     */
    disconnect(): void;
    /**
     * Called when a data value has changed
     */
    valueChanged(name: string, value: unknown): void;
}
