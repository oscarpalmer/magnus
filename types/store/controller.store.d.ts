import { Context } from '../controller/context';
import type { ControllerConstructor } from '../models';
declare class Controllers {
    private readonly stored;
    add(name: string, element: Element): void;
    create(name: string, ctor: ControllerConstructor): void;
    findContext(origin: Element, name: string, id?: string): Context | undefined;
    has(name: string): boolean;
    remove(name: string, element?: Element): void;
    private removeInstance;
}
export declare class StoredController {
    readonly ctor: ControllerConstructor;
    readonly instances: Map<Element, Context>;
    constructor(ctor: ControllerConstructor);
}
export declare const controllers: Controllers;
export {};
