export declare class Targets {
    private readonly store;
    add(name: string, element: Element): void;
    clear(): void;
    get(name: string): Element[];
    remove(name: string, element: Element): void;
}
