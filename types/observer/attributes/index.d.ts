import type { Context } from '../../controller/context';
import type { AttributeType } from '../../models';
export declare function handleContextualAttribute(type: AttributeType, element: Element, name: string, value: string, added: boolean): void;
export declare function handleControllerAttribute(element: Element, name: string, added: boolean): void;
export declare function handleAttributes(context: Context): void;
export declare function handleTargetAttribute(context: Context, element: Element, name: string, _: string, added: boolean): void;
