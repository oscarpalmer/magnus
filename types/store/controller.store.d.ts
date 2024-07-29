import type { Context, ControllerConstructor, StoredController } from '../models';
export declare const controllers: Map<string, StoredController>;
export declare function addController(name: string, element: Element): void;
export declare function createController(name: string, ctor: ControllerConstructor): void;
export declare function findContext(origin: Element, name: string, id?: string): Context | undefined;
export declare function removeController(name: string, element?: Element): void;
