export type Targets = {
    add(name: string, element: Element): void;
    clear(): void;
    get(name: string): Element[];
    remove(name: string, element: Element): void;
};
export declare function createTargets(): Targets;
