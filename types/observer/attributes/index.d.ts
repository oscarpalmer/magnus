import type { Context } from '../../controller/context';
export type AttributeChangeCallback = (element: Element, name: string, value: string, added: boolean) => void;
export type AttributeHandleCallback = (context: Context, element: Element, name: string, value: string, added: boolean, handler?: (event: Event) => void) => void;
export type AttributeHandleParameters = {
    added: boolean;
    callbacks: Record<string, AttributeChangeCallback>;
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
export declare const attributeActionPattern: RegExp;
export declare const attributeTargetPattern: RegExp;
export declare function handleAttributeChanges(parameters: AttributeHandleParameters): void;
export declare function handleControllerAttribute(element: Element, _: string, value: string, added: boolean): void;
export declare function handleAttributes(context: Context): void;
