import type { AttributeHandleCallback } from './index';
export declare function handleInputAttribute(element: Element, _: string, value: string, added: boolean): void;
export declare function handleOutputAttribute(element: Element, _: string, value: string, added: boolean): void;
export declare function handleTarget(type: 'action' | 'target', element: Element, value: string, added: boolean, callback: AttributeHandleCallback): void;
export declare function handleTargetAttribute(element: Element, _: string, value: string, added: boolean): void;
