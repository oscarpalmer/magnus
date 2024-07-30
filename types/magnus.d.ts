import type { ControllerConstructor } from './models';
export declare class Magnus {
    /**
     * Adds a named controller to observe
     */
    add(name: string, ctor: ControllerConstructor): void;
    /**
     * Removes a named controller from observation
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
