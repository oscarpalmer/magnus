import type {AttributeHandleCallback, AttributeType} from './models';
import {handleActionAttribute} from './observer/attributes/action.attribute';
import {
	handleInputAttribute,
	handleOutputAttribute,
} from './observer/attributes/input-output.attribute';
import {handleTargetElement} from './observer/attributes/target.attribute';

export const attributeCallbacks: Record<
	AttributeType,
	AttributeHandleCallback
> = {
	action: handleActionAttribute,
	input: handleInputAttribute,
	output: handleOutputAttribute,
	target: handleTargetElement,
};

export const attributeTypes = Object.keys(
	attributeCallbacks,
) as AttributeType[];

export const attributeTypesLength = attributeTypes.length;

//

export const controllerAttribute = 'data-controller';

//

// (event->)controller(#id)@method(:options)
export const actionAttributePattern =
	/^(?:(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;

// ((external(#id)@)event->)controller(#id)@method(:options)
export const extendedActionAttributePattern =
	/^(?:(?:(?:(\w+)(?:#(\w+))?)?@)?(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;

// controller(#id).target
export const targetAttributePattern = /^(\w+)(?:#(\w+))?\.(\w+)$/i;

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
