import {camelCase} from '@oscarpalmer/atoms/string';
import {
	EVENT_DEFAULTS,
	EXPRESSION_ACTION_ATTRIBUTE_NAME,
	EXPRESSION_ACTION_ATTRIBUTE_VALUE,
	EXPRESSION_METHOD_INVALID,
} from '../constants';
import type {EventParameters} from '../models';

export function getEventParameters(
	element: Element,
	name: string,
	value: string,
): EventParameters | undefined {
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

	if (type != null && !EXPRESSION_METHOD_INVALID.test(method)) {
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
}

function getOptions(options: string): AddEventListenerOptions {
	const items = options.toLowerCase().split(':');

	return {
		capture: items.includes('capture') || items.includes('c'),
		once: items.includes('once') || items.includes('o'),
		passive: !(items.includes('active') || items.includes('a')),
	};
}

function getType(element: Element): string | undefined {
	if (element instanceof HTMLInputElement) {
		return element.type === 'submit' ? 'submit' : 'input';
	}

	return EVENT_DEFAULTS[element.tagName];
}
