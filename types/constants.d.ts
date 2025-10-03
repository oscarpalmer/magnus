/**
 * - `::(controller.)(identifier.)action(:options)`
 * - `[, name, id?, value, options?]`
 */
export declare const actionAttributeNamePattern: RegExp;
/**
 * - `controller(.identifier)@action(:options)`
 * - `[, name, id?, value, options?]`
 */
export declare const actionAttributeValuePattern: RegExp;
/**
 * - `:controller`
 * - `[, name]`
 */
export declare const controllerAttributePattern: RegExp;
export declare const controllerAttributePrefixPattern: RegExp;
/**
 * `controller-data-attribute`
 */
export declare const dataAttributePattern: RegExp;
/**
 * Pattern to match global event origin
 */
export declare const documentPattern: RegExp;
/**
 * - `controller(.identifier).property(:json)`
 * - `[, name, id?, value]`
 */
export declare const inputOutputAttributePattern: RegExp;
export declare const inputOutputAttributePrefixPattern: RegExp;
/**
 * - `controller(.identifier):target`
 * - `[, name, id?, value]`
 */
export declare const targetAttributePattern: RegExp;
export declare const targetAttributePrefixPattern: RegExp;
/**
 * Pattern to match global event origin
 */
export declare const windowPattern: RegExp;
/**
 * Input types that should trigger `change`, not `input`
 */
export declare const changeEventTypes: Set<string>;
/**
 * Default events for element types
 */
export declare const defaultEvents: Record<string, string>;
/**
 * Input types that should be ignored
 */
export declare const ignoredInputTypes: Set<string>;
/**
 * Input types that should be handled as `number`
 */
export declare const numberInputTypes: Set<string>;
/**
 * Input types that should be parsed
 */
export declare const parseableInputTypes: Set<string>;
