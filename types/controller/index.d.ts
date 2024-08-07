import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { GetTargets } from '../models';
import type { Context } from './context';
export declare abstract class Controller<Data extends PlainObject = PlainObject> {
    protected readonly context: Context;
    /**
     * The controller's primary element
     */
    get element(): Element;
    /**
     * Controller data
     */
    get data(): Data;
    /**
     * Controller name
     */
    get name(): string;
    /**
     * The controller's targets
     */
    get targets(): GetTargets;
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
