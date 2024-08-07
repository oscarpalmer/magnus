import type { GetTargets } from '../models';
export declare class Targets {
    private readonly callbacks;
    private readonly store;
    get getters(): GetTargets;
    constructor(element: Element);
    add(name: string, element: Element): void;
    clear(): void;
    get<Target extends Element = Element>(name: string): Target | undefined;
    getAll<Target extends Element = Element>(name: string): Target[];
    has(name: string): boolean;
    remove(name: string, element: Element): void;
}
