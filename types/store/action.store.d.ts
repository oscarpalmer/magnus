export type Actions = {
    add(name: string, element: Element): void;
    clear(): void;
    create(parameters: Parameters): void;
    has(name: string): boolean;
    remove(name: string, element: Element): void;
};
type Parameters = {
    callback: (event: Event) => void;
    name: string;
    options: AddEventListenerOptions;
    target: EventTarget;
    type: string;
};
export declare function createActions(): any;
export {};
