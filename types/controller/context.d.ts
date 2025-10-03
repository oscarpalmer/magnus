import type { ControllerConstructor } from '../models';
import { Actions } from '../store/action.store';
import { Data } from '../store/data.store';
import { Targets } from '../store/target.store';
import { Events } from './events';
type State = {
    name: string;
    element: Element;
};
export declare class Context {
    readonly actions: Actions;
    readonly controller: InstanceType<ControllerConstructor>;
    readonly data: Data;
    readonly events: Events;
    readonly state: State;
    readonly targets: Targets;
    constructor(name: string, element: Element, creator: ControllerConstructor);
}
export {};
