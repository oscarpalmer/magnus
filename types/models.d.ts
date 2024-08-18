import type { GenericCallback } from '@oscarpalmer/atoms/models';
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
    element: Element;
    handler: AttributeChangeCallback | undefined;
    value: string;
};
export type AttributeType = 'action' | 'input' | 'output' | 'target';
export type ControllerConstructor = new (context: Context) => Controller;
export type DataType = 'boolean' | 'parseable' | 'string';
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
export type ExtendedEventTarget = string | EventTarget;
export type ObserverCallback = (element: Element, name: string, value: string) => void;
export type ParsedAttribute = {
    id?: string;
    name: string;
    value: string;
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
