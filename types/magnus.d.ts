import type { ControllerConstructor } from './models';
export declare class Magnus {
    /**
     * Is Magnus active?
     */
    get active(): boolean;
    /**
     * Adds a named controller to observe
     */
    add(name: string, ctor: ControllerConstructor): void;
    /**
     * Removes a named controller _(and all its instances)_ from observation
     */
    remove(name: string): void;
    /**
     * Starts the observer
     */
    start(): void;
    /**
     * Stops the observer
     */
    stop(): void;
}
declare const magnus: Magnus;
export default magnus;
