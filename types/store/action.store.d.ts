import type { DispatchOptions } from '@oscarpalmer/toretto/models';
import type { Context } from '../controller/context';
import type { ActionParameters, DispatchTarget, ReadonlyActions } from '../models';
export declare class Action {
    readonly callback: (event: Event) => void;
    readonly options: AddEventListenerOptions;
    readonly targets: Set<EventTarget>;
    readonly type: string;
    constructor(parameters: ActionParameters);
}
export declare class Actions {
    private readonly context;
    private readonly store;
    get readonly(): ReadonlyActions;
    constructor(context: Context);
    add(name: string, target: EventTarget): void;
    clear(): void;
    create(parameters: ActionParameters): void;
    dispatch(type: string, first?: DispatchTarget | DispatchOptions, second?: DispatchTarget): void;
    has(name: string): boolean;
    remove(name: string, target: EventTarget): void;
}
