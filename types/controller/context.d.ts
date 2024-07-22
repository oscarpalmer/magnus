import type { Observer } from '../observer/observer';
import { type Actions } from '../store/action.store';
import { type Data } from '../store/data.store';
import { type Targets } from '../store/target.store';
import type { Controller, ControllerConstructor } from './controller';
export type Context = {
    readonly actions: Actions;
    readonly controller: Controller;
    readonly data: Data;
    readonly element: Element;
    readonly identifier: string;
    readonly observer: Observer;
    readonly targets: Targets;
};
export declare function createContext(name: string, element: Element, ctor: ControllerConstructor): Context;
