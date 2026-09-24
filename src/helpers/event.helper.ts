import {camelCase} from '@oscarpalmer/atoms/string/case';
import {
	EVENT_DEFAULTS,
	EXPRESSION_EVENT_ACTIVE,
	EXPRESSION_EVENT_CAPTURE,
	EXPRESSION_EVENT_ONCE,
	EXPRESSION_INVALID_METHOD,
} from '../constants';
import type {EventAttributeParameters, ParsedAttribute} from '../models';

// #region Functions

export function getEventParameters(
	element: Element,
	attribute: ParsedAttribute,
): EventAttributeParameters | undefined {
	let external: string | undefined;
	let identifier: string | undefined;
	let method: string | undefined;
	let options: string | undefined;
	let type: string | undefined;

	if (attribute.matches[1] == null) {
		[, , , method, options] = attribute.matches[0];
	} else {
		[, external, identifier, type] = attribute.matches[0];
		[, , , method, options] = attribute.matches[1];
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
		return element.type === 'submit' ? 'click' : 'input';
	}

	return EVENT_DEFAULTS[element.tagName];
}

// #endregion
