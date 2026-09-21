import {camelCase} from '@oscarpalmer/atoms/string/case';
import {
	EVENT_DEFAULTS,
	EXPRESSION_ACTION_ATTRIBUTE_NAME,
	EXPRESSION_ACTION_ATTRIBUTE_VALUE,
	EXPRESSION_EVENT_ACTIVE,
	EXPRESSION_EVENT_CAPTURE,
	EXPRESSION_EVENT_ONCE,
	EXPRESSION_INVALID_METHOD,
} from '../constants';
import type {EventAttributeParameters} from '../models';

// #region Functions

export function getEventParameters(
	element: Element,
	name: string,
	value: string,
): EventAttributeParameters | undefined {
	const nameMatches = EXPRESSION_ACTION_ATTRIBUTE_NAME.exec(name) as RegExpExecArray;
	const valueMatches = EXPRESSION_ACTION_ATTRIBUTE_VALUE.exec(value);

	let external: string | undefined;
	let identifier: string | undefined;
	let method: string | undefined;
	let options: string | undefined;
	let type: string | undefined;

	if (valueMatches == null) {
		[, , , method, options] = nameMatches;
	} else {
		[, external, identifier, type] = nameMatches;
		[, , , method, options] = valueMatches;
	}

	type = type ?? getType(element);

	if (type == null || EXPRESSION_INVALID_METHOD.test(method)) {
		return undefined;
	}

	return {
		callback: camelCase(method),
		external:
			external == null
				? undefined
				: {
						identifier,
						name: external,
					},
		options: getOptions(options ?? ''),
		type: camelCase(type),
	};
}

function getOptions(options: string): AddEventListenerOptions {
	const items = options.toLowerCase().split(':');

	return {
		capture: items.some(item => EXPRESSION_EVENT_CAPTURE.test(item)),
		once: items.some(item => EXPRESSION_EVENT_ONCE.test(item)),
		passive: !items.some(item => EXPRESSION_EVENT_ACTIVE.test(item)),
	};
}

function getType(element: Element): string | undefined {
	if (element instanceof HTMLInputElement) {
		return element.type === 'submit' ? 'submit' : 'input';
	}

	return EVENT_DEFAULTS[element.tagName];
}

// #endregion
