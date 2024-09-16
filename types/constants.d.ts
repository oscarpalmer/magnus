import type { AttributeHandleCallback, AttributeType } from './models';
export declare const attributeCallbacks: Partial<Record<AttributeType, AttributeHandleCallback>>;
/**
 * - `::controller(.identifier).action(:options)` _(options allowed, should not have attribute value)_
 * - `::(external(.identifier).)event` _(options ignored, should have attribute value)_
 * - `[, name, id?, value, options?]`
 */
export declare const actionAttributeNamePattern: RegExp;
/**
 * - `controller(.identifier)::action(:options)`
 * - `[, name, id?, value, options?]`
 */
export declare const actionAttributeValuePattern: RegExp;
/**
 * - `:controller`
 * - `[, name]`
 */
export declare const controllerAttributePattern: RegExp;
/**
 * - `:controller(.identifier):property``
 * - `[, name, id?, value]`
 */
export declare const inputOutputAttributePattern: RegExp;
export declare const inputOutputAttributePrefixPattern: RegExp;
/**
 * - `:target(.identifier).target`
 * - `[, name, id?, value]`
 */
export declare const targetAttributePattern: RegExp;
export declare const targetAttributePrefixPattern: RegExp;
export declare const changeEventTypes: Set<string>;
export declare const defaultEvents: Record<string, string>;
export declare const ignoredInputTypes: Set<string>;
export declare const parseableInputTypes: Set<string>;
