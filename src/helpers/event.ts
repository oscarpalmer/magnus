import {
	actionAttributePattern,
	defaultEvents,
	extendedActionAttributePattern,
} from '../constants';
import type {EventMatches, EventParameters} from '../models';

export function getEventParameters(
	element: Element,
	action: string,
	isParent: boolean,
): EventParameters | undefined {
	const results = (
		isParent ? extendedActionAttributePattern : actionAttributePattern
	).exec(action);

	if (results != null) {
		const matches = getMatches(results, isParent);

		const parameters: EventParameters = {
			callback: matches.callback,
			options: getOptions(matches.options ?? ''),
			type: (matches.event ?? getType(element)) as never,
		};

		if (typeof matches.name === 'string') {
			parameters.external = {
				name: matches.name,
				id: matches.id,
			};
		}

		return parameters.type == null ? undefined : parameters;
	}
}

function getMatches(matches: RegExpExecArray, isParent: boolean): EventMatches {
	return {
		callback: matches[isParent ? 6 : 4],
		event: matches[isParent ? 3 : 1],
		id: matches[isParent ? 2 : -1],
		name: matches[isParent ? 1 : -1],
		options: matches[isParent ? 7 : 5],
	};
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
