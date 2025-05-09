import type { ControllerConstructor } from '../models';
import { Actions } from '../store/action.store';
import { Data } from '../store/data.store';
import { Targets } from '../store/target.store';
import { Events } from './events';
export declare class Context {
    readonly name: string;
    readonly element: Element;
    readonly actions: Actions;
    readonly controller: InstanceType<ControllerConstructor>;
    readonly data: Data;
    readonly events: Events;
    readonly targets: Targets;
    constructor(name: string, element: Element, creator: ControllerConstructor);
}
