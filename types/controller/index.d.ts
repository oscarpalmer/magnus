import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { Context } from './context';
export declare abstract class Controller<Model extends PlainObject = PlainObject> {
    protected readonly context: Context;
    /**
     * The controller's primary element
     */
    get element(): Element;
    /**
     * Controller data
     */
    get data(): Model;
    /**
     * Controller name
     */
    get name(): string;
    constructor(context: Context);
    /**
     * Called when the controller is connected
     */
    abstract connected(): void;
    /**
     * Called when the controller is disconnected
     */
    abstract disconnected(): void;
}
