import type {AttributeHandleCallback, AttributeType} from './models';
import {handleTargetAttribute} from './observer/attributes';
import {handleActionAttribute} from './observer/attributes/action.attribute';
import {handleInputOutputAttribute} from './observer/attributes/input-output.attribute';

export const attributeCallbacks: Partial<
	Record<AttributeType, AttributeHandleCallback>
> = {
	action: handleActionAttribute,
	'input-output': handleInputOutputAttribute,
	target: handleTargetAttribute,
};

//

/**
 * - `::controller(.identifier).action(:options)` _(options allowed, should not have attribute value)_
 * - `::(external(.identifier).)event` _(options ignored, should have attribute value)_
 * - `[, name, id?, value, options?]`
 */
export const actionAttributeNamePattern =
	/^::(?:([\w-]+)(?:\.([\w-]+))?\.)?([\w-]+)(?::([a-z:]+))?$/i;

/**
 * - `controller(.identifier)::action(:options)`
 * - `[, name, id?, value, options?]`
 */
export const actionAttributeValuePattern =
	/^([\w-]+)(?:\.([\w-]+))?\.([\w-]+)(?::([a-z:]+))?$/;

/**
 * - `:controller`
 * - `[, name]`
 */
export const controllerAttributePattern = /^:([\w-]+)$/;

/**
 * - `:controller(.identifier):property``
 * - `[, name, id?, value]`
 */
export const inputOutputAttributePattern =
	/^:([\w-]+)(?:\.([\w-]+))?\:([\w-]*)(?::json)?$/;

export const inputOutputAttributePrefixPattern = /^:[\w-]+:/;

/**
 * - `:target(.identifier).target`
 * - `[, name, id?, value]`
 */
export const targetAttributePattern = /^:([\w-]+)(?:\.([\w-]+))?\.([\w-]+)$/;

export const targetAttributePrefixPattern = /^:[\w-]+\./;

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
