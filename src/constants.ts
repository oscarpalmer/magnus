/**
 * - `::(controller.)(identifier.)action(:options)`
 * - `[, name, id?, value, options?]`
 */
export const actionAttributeNamePattern =
	/^::(?:([\w-]+)\.(?:([\w-]+)\.)?)?([\w-]+)(?::([a-z:]+))?$/i;

/**
 * - `controller(.identifier)@action(:options)`
 * - `[, name, id?, value, options?]`
 */
export const actionAttributeValuePattern =
	/^([\w-]+)(?:\.([\w-]+))?@([\w-]+)(?::([a-z:]+))?$/i;

/**
 * - `:controller`
 * - `[, name]`
 */
export const controllerAttributePattern = /^:([\w-]+)$/;

export const controllerAttributePrefixPattern = /^:/;

/**
 * `controller-data-attribute`
 */
export const dataAttributePattern = /^\w+\-[\w-]+$/;

/**
 * Pattern to match global event origin
 */
export const documentPattern = /^document$/i;

/**
 * - `controller(.identifier).property(:json)`
 * - `[, name, id?, value]`
 */
export const inputOutputAttributePattern =
	/^([\w-]+)(?:\.([\w-]+))?\.([\w-]*)(?::json)?$/;

export const inputOutputAttributePrefixPattern = /^[\w-]+(?:\.[\w-]+)?\./;

/**
 * - `controller(.identifier):target`
 * - `[, name, id?, value]`
 */
export const targetAttributePattern = /^([\w-]+)(?:\.([\w-]+))?:([\w-]+)$/;

export const targetAttributePrefixPattern = /^[\w-]+(?:\.[\w-]+)?:/;

/**
 * Pattern to match global event origin
 */
export const windowPattern = /^window$/i;

//

/**
 * Input types that should trigger `change`, not `input`
 */
export const changeEventTypes = new Set(['checkbox', 'radio']);

/**
 * Default events for element types
 */
export const defaultEvents: Record<string, string> = {
	A: 'click',
	BUTTON: 'click',
	DETAILS: 'toggle',
	FORM: 'submit',
	SELECT: 'change',
	TEXTAREA: 'input',
};

//

/**
 * Input types that should be ignored
 */
export const ignoredInputTypes = new Set([
	'button',
	'image',
	'reset',
	'submit',
]);

/**
 * Input types that should be handled as `number`
 */
export const numberInputTypes = new Set(['number', 'range']);

/**
 * Input types that should be parsed
 */
export const parseableInputTypes = new Set(['checkbox', 'hidden', 'radio']);
