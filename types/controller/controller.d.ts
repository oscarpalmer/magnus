import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { Context } from './context';
export declare const attribute = "data-controller";
export type ControllerConstructor = new (context: Context) => Controller;
export declare abstract class Controller<Model extends PlainObject = PlainObject> {
    protected readonly context: Context;
    get element(): Element;
    get data(): Model;
    get identifier(): string;
    constructor(context: Context);
    abstract connected(): void;
    abstract disconnected(): void;
}
