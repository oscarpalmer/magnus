export type Actions = {
    add(name: string, target: EventTarget): void;
    clear(): void;
    create(parameters: Parameters): void;
    has(name: string): boolean;
    remove(name: string, target: EventTarget): void;
};
type Parameters = {
    callback: (event: Event) => void;
    name: string;
    options: AddEventListenerOptions;
    type: string;
};
export declare function createActions(): any;
export {};
