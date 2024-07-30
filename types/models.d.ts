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
    callback: AttributeChangeCallback;
    element: Element;
    from: string;
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
    callback: AttributeChangeCallback;
    element: Element;
    name: string;
    value: string;
};
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
export type ObserverCallback = (element: Element, name: string, value: string, added: boolean) => void;
export type ParsedAttribute = {
    id?: string;
    name: string;
    value: string;
};
