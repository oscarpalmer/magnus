import type { Context } from '../controller/context';
import type { ReadonlyTargets } from '../models';
export declare class Targets {
    private readonly context;
    private readonly callbacks;
    private readonly store;
    get readonly(): ReadonlyTargets;
    constructor(context: Context);
    add(name: string, element: Element): void;
    clear(): void;
    find(selector: string): Element | null;
    findAll(selector: string): Element[];
    get(name: string): Element | undefined;
    getAll(name: string): Element[];
    has(name: string): boolean;
    remove(name: string, element: Element): void;
}
