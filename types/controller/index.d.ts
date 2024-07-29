import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { Context } from '../models';
export declare abstract class Controller<Model extends PlainObject = PlainObject> {
    protected readonly context: Context;
    get element(): Element;
    get data(): Model;
    get name(): string;
    constructor(context: Context);
    abstract connected(): void;
    abstract disconnected(): void;
}
