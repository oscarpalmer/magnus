import type { Context } from '../../controller/context';
export type AttributeChangeCallback = (element: Element, name: string, value: string, added: boolean) => void;
export type AttributeHandleCallback = (context: Context, element: Element, name: string, value: string, added: boolean, handler?: (event: Event) => void) => void;
export type AttributeHandleParameters = {
    added: boolean;
    callback: AttributeChangeCallback;
    element: Element;
    name: string;
    value: string;
};
export type AttributeChangesParameters = {
    callback: AttributeChangeCallback;
    element: Element;
    from: string;
    name: string;
    to: string;
};
export declare function handleAttributeChanges(parameters: AttributeHandleParameters, initial: boolean): void;
export declare function handleControllerAttribute(element: Element, _: string, value: string, added: boolean): void;
export declare function handleAttributes(context: Context): void;
