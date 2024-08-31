import type { ActionParameters } from '../models';
export declare class Action {
    readonly callback: (event: Event) => void;
    readonly options: AddEventListenerOptions;
    readonly targets: Set<EventTarget>;
    readonly type: string;
    constructor(parameters: ActionParameters);
}
export declare class Actions {
    private readonly store;
    add(name: string, target: EventTarget): void;
    clear(): void;
    create(parameters: ActionParameters, target: EventTarget): void;
    has(name: string): boolean;
    remove(name: string, target: EventTarget): void;
}
