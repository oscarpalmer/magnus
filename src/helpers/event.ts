import {
	actionAttributePattern,
	extendedActionAttributePattern,
} from './attribute';

export type EventParameters = {
		callback: string;
		external?: ExternalController;
		options: AddEventListenerOptions;
		type: string;
	};

type ExternalController = {
	controller: string;
	identifier?: string;
};

type Matches = {
	callback: string;
	controller?: string;
	event?: string;
	identifier?: string;
	options?: string;
};

const defaultEvents: Record<string, string> = {
	A: 'click',
	BUTTON: 'click',
	DETAILS: 'toggle',
	FORM: 'submit',
	SELECT: 'change',
	TEXTAREA: 'input',
};

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

		if (typeof matches.controller === 'string') {
			parameters.external = {
				controller: matches.controller,
				identifier: matches.identifier,
			};
		}

		return parameters.type == null ? undefined : parameters;
	}
}

function getMatches(matches: RegExpExecArray, isParent: boolean): Matches {
	return {
		callback: matches[isParent ? 6 : 4],
		controller: matches[isParent ? 1 : -1],
		event: matches[isParent ? 3 : 1],
		identifier: matches[isParent ? 2 : -1],
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
