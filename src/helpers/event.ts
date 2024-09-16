import {camelCase} from '@oscarpalmer/atoms';
import {
	actionAttributeNamePattern,
	actionAttributeValuePattern,
	defaultEvents,
} from '../constants';
import type {EventParameters} from '../models';

export function getEventParameters(
		element: Element,
		name: string,
		value: string,
	): EventParameters | undefined {
		const nameMatches = actionAttributeNamePattern.exec(name);

		if (nameMatches == null) {
			return;
		}

		const valueMatches = actionAttributeValuePattern.exec(value);

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

		if (type != null) {
			return {
				type,
				callback: camelCase(method),
				external:
					external == null
						? undefined
						: {
								identifier,
								name: external,
							},
				options: getOptions(options ?? ''),
			};
		}
	}

function getOptions(options: string): AddEventListenerOptions {
	const items = options.toLowerCase().split(':');

	return {
		capture: items.includes('capture') || items.includes('c'),
		once: items.includes('once') || items.includes('o'),
		passive: !items.includes('active') && !items.includes('a'),
	};
}

function getType(element: Element): string | undefined {
	return element instanceof HTMLInputElement
		? element.type === 'submit'
			? 'submit'
			: 'input'
		: defaultEvents[element.tagName];
}
