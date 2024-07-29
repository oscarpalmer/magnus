import type { ParsedAttribute } from '../models';
export declare const actionAttributePattern: RegExp;
export declare const extendedActionAttributePattern: RegExp;
export declare function parseAttribute(type: 'action' | 'target', value: string): ParsedAttribute | undefined;
