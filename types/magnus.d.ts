import type { ControllerConstructor } from './models';
export declare class Magnus {
    add(name: string, ctor: ControllerConstructor): void;
    remove(name: string): void;
    start(): void;
    stop(): void;
}
declare const magnus: Magnus;
export default magnus;
