import type { Context } from '../../controller/context';
import type { AttributeHandleParameters } from '../../models';
export declare function handleAttributeChanges(parameters: AttributeHandleParameters, initial: boolean): void;
export declare function handleControllerAttribute(element: Element, value: string, added: boolean): void;
export declare function handleAttributes(context: Context): void;
