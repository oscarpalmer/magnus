import type { AttributeHandleCallback, Context } from '../../models';
export declare function handleTarget(type: 'action' | 'target', element: Element, value: string, added: boolean, callback: AttributeHandleCallback): void;
export declare function handleTargetAttribute(element: Element, value: string, added: boolean): void;
export declare function handleTargetElement(context: Context, element: Element, value: string, added: boolean): void;
