import type {AttributeHandleCallback, AttributeType} from './models';
import {handleTargetAttribute} from './observer/attributes';
import {handleActionAttribute} from './observer/attributes/action.attribute';
import {handleInputOutputAttribute} from './observer/attributes/input-output.attribute';

export const attributeCallbacks: Partial<
	Record<AttributeType, AttributeHandleCallback>
> = {
	action: handleActionAttribute,
	io: handleInputOutputAttribute,
	target: handleTargetAttribute,
};

//

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
export const dataAttributePattern = /^\w+\-([^.:][\w-])+$/;

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

//

let count = 0;

try {
	// This selector works with Happy DOM, but not in a real browser environment
	document.body.querySelector('[:test]');
} catch (error) {
	try {
		// This selectors works in a real browser environment, but not with Happy DOM
		// biome-ignore lint/style/noUnusedTemplateLiteral: A non-templated string would be normalized into '[:test]', and wouldn't be a valid selector
		document.body.querySelector(`[\\:test]`);

		count = 1;
	} catch (error) {
		count = -1;
	}
}

let slashes = '';

if (count > 0) {
	// biome-ignore lint/style/noUnusedTemplateLiteral: A non-templated string would be normalized into '\', and wouldn't work as part of a selector
	slashes = `\\`;
}

export {slashes};
