import type { ObserverCallback } from '../models';
export declare class Observer {
    private readonly element;
    private readonly options;
    private readonly callback;
    private frame;
    private readonly observer;
    private running;
    constructor(element: Element, options: MutationObserverInit, callback: ObserverCallback);
    start(): void;
    stop(): void;
    update(): void;
}
export declare function createObserver(element: Element, options: MutationObserverInit, callback: ObserverCallback): Observer;
