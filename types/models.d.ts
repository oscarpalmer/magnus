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
export type AttributeHandleCallback = (context: Context, element: Element, name: string, value: string, added: boolean, custom?: {
    event: string;
    callback: GenericCallback;
}) => void;
export type AttributeHandleCallbackCustomParameters = {
    callback: GenericCallback;
    event: string;
};
export type AttributeHandleParameters = {
    callback?: AttributeChangeCallback;
    element: Element;
    value: string;
};
export type AttributeType = 'action' | 'controller' | 'data' | 'io' | 'target';
export type ControllerConstructor = new (context: Context) => Controller;
export type ControllerDataTypes = Record<string, ControllerDataType>;
export type ControllerDataType = 'array' | 'boolean' | 'number' | 'object' | 'string';
export type DataType = 'boolean' | 'number' | 'parseable' | 'string';
export type EventParameters = {
    callback: string;
    external?: EventExternal;
    options: AddEventListenerOptions;
    type: string;
};
export type EventExternal = {
    identifier?: string;
    name: string;
};
export type ExtendedEventTarget = string | EventTarget;
export type ObserverCallback = (element: Element, name: string, value: string) => void;
export type ParsedAttribute = {
    identifier?: string;
    name: string;
};
export type ReadonlyTargets = {
    /**
     * Find an element within the controller
     */
    find<Found extends Element = Element>(selector: string): Found | null;
    /**
     * Find all elements within the controller
     */
    findAll<Found extends Element = Element>(selector: string): Found[];
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
