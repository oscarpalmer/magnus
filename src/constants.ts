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

//

export const changeEventTypes = new Set(['checkbox', 'radio']);

export const defaultEvents: Record<string, string> = {
	A: 'click',
	BUTTON: 'click',
	DETAILS: 'toggle',
	FORM: 'submit',
	SELECT: 'change',
	TEXTAREA: 'input',
};

//

export const ignoredInputTypes = new Set([
	'button',
	'image',
	'submit',
	'reset',
]);

export const parseableInputTypes = new Set([
	'hidden',
	'number',
	'radio',
	'range',
	'week',
]);
