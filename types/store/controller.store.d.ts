import { type Context } from '../controller/context';
import type { ControllerConstructor } from '../controller/index';
type StoredController = {
    constructor: ControllerConstructor;
    instances: Map<Element, Context>;
};
export declare const controllers: Map<string, StoredController>;
export declare function addController(name: string, element: Element): void;
export declare function createController(name: string, ctor: ControllerConstructor): void;
export declare function findContext(origin: Element, controller: string, identifier?: string): Context | undefined;
export declare function removeController(name: string, element?: Element): void;
export {};
