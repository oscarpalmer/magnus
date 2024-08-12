import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { ExtendedEventTarget } from '../models';
import type { Context } from './context';
type RemoveEventListener = () => void;
export declare class Events {
    private readonly context;
    constructor(context: Context);
    /**
     * Dispatch an event for the controller
     */
    dispatch<Type extends keyof HTMLElementEventMap>(type: Type): void;
    /**
     * Dispatch an event for the controller
     */
    dispatch(type: string): void;
    /**
     * - Dispatch an event for a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     */
    dispatch<Type extends keyof HTMLElementEventMap>(type: Type, target: ExtendedEventTarget): void;
    /**
     * - Dispatch an event for a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     */
    dispatch(type: string, target: ExtendedEventTarget): void;
    /**
     * - Dispatch an event with specific options
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     * - It target is not provided, the controller's element will be used
     */
    dispatch<Type extends keyof HTMLElementEventMap>(type: Type, options: CustomEventInit, target?: ExtendedEventTarget): void;
    /**
     * - Dispatch an event with specific options
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     * - It target is not provided, the controller's element will be used
     */
    dispatch(type: string, options?: PlainObject, target?: ExtendedEventTarget): void;
    /**
     * Remove an event listener from the controller's element
     */
    off<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener): void;
    /**
     * Remove an event listener from the controller's element
     */
    off(type: string, listener: EventListener): void;
    /**
     * - Remove an event listener from a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     */
    off<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener, target: ExtendedEventTarget): void;
    /**
     * - Remove an event listener from a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     */
    off(type: string, listener: EventListener, target: ExtendedEventTarget): void;
    /**
     * - Remove an event listener from a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     */
    off<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener, options: boolean | EventListenerOptions, target?: ExtendedEventTarget): void;
    /**
     * - Remove an event listener from a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     */
    off(type: string, listener: EventListener, options: boolean | EventListenerOptions, target?: ExtendedEventTarget): void;
    /**
     * - Add an event listener to the controller's element
     * ---
     * - Returns a function that removes the event listener
     */
    on<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener): RemoveEventListener;
    /**
     * - Add an event listener to the controller's element
     * ---
     * - Returns a function that removes the event listener
     */
    on(type: string, listener: EventListener): RemoveEventListener;
    /**
     * - Add an event listener to a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     * - Returns a function that removes the event listener
     */
    on<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener, target: ExtendedEventTarget): RemoveEventListener;
    /**
     * - Add an event listener to a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     * - Returns a function that removes the event listener
     */
    on(type: string, listener: EventListener, target: ExtendedEventTarget): RemoveEventListener;
    /**
     * - Add an event listener to a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     * - Returns a function that removes the event listener
     */
    on<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener, options: boolean | AddEventListenerOptions, target?: ExtendedEventTarget): RemoveEventListener;
    /**
     * - Add an event listener to a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     * - Returns a function that removes the event listener
     */
    on(type: string, listener: EventListener, options: boolean | AddEventListenerOptions, target?: ExtendedEventTarget): RemoveEventListener;
}
export {};
