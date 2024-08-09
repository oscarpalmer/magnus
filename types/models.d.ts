import type { GenericCallback, PlainObject } from '@oscarpalmer/atoms/models';
import type { DispatchOptions } from '@oscarpalmer/toretto';
import type { Controller } from './controller';
import type { Context } from './controller/context';
export type ActionParameters = {
    callback: (event: Event) => void;
    name: string;
    options: AddEventListenerOptions;
    type: string;
};
export type AttributeChangeCallback = (element: Element, value: string, added: boolean) => void;
export type AttributeChangesParameters = {
    element: Element;
    from: string;
    handler: AttributeChangeCallback | undefined;
    name: string;
    to: string;
};
export type AttributeHandleCallback = (context: Context, element: Element, value: string, added: boolean, custom?: {
    event: string;
    handler: GenericCallback;
}) => void;
export type AttributeHandleCallbackCustomParameters = {
    event: string;
    handler: GenericCallback;
};
export type AttributeHandleParameters = {
    added: boolean;
    element: Element;
    handler: AttributeChangeCallback | undefined;
    value: string;
};
export type AttributeType = 'action' | 'input' | 'output' | 'target';
export type ControllerConstructor = new (context: Context) => Controller;
export type DataType = 'boolean' | 'parseable' | 'string';
export type DispatchTarget = string | EventTarget;
export type EventParameters = {
    callback: string;
    external?: EventController;
    options: AddEventListenerOptions;
    type: string;
};
export type EventController = {
    id?: string;
    name: string;
};
export type EventMatches = {
    callback: string;
    event?: string;
    id?: string;
    name?: string;
    options?: string;
};
export type ObserverCallback = (element: Element, name: string, value: string, added: boolean) => void;
export type ParsedAttribute = {
    id?: string;
    name: string;
    value: string;
};
export type ReadonlyActions = {
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
    dispatch<Type extends keyof HTMLElementEventMap>(type: Type, target: DispatchTarget): void;
    /**
     * - Dispatch an event for a target element
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     */
    dispatch(type: string, target: DispatchTarget): void;
    /**
     * - Dispatch an event with specific options
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     * - It target is not provided, the controller's element will be used
     */
    dispatch<Type extends keyof HTMLElementEventMap>(type: Type, options: DispatchOptions, target?: DispatchTarget): void;
    /**
     * - Dispatch an event with specific options
     * ---
     * - If target is a `string`, the controller will use the first matching target element
     * - It target is not provided, the controller's element will be used
     */
    dispatch(type: string, options?: PlainObject, target?: DispatchTarget): void;
};
export type ReadonlyTargets = {
    /**
     * Find elements within the controller's element
     */
    find<Found extends Element = Element>(selector: string): Found[];
    /**
     * Get the first element with the given target name
     */
    get<Target extends Element = Element>(name: string): Target | undefined;
    /**
     * Get all elements with the given target name
     */
    getAll<Target extends Element = Element>(name: string): Target[];
    /**
     * Does the controller have any elements with the given target name?
     */
    has(name: string): boolean;
};
