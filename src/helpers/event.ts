import {actionAttributePattern} from './attribute';

export type EventParameters = {
	callback: string;
	options: AddEventListenerOptions;
	type: string;
};

const defaultEvents: Record<string, string> = {
	A: 'click',
	BUTTON: 'click',
	DETAILS: 'toggle',
	FORM: 'submit',
	SELECT: 'change',
	TEXTAREA: 'input',
};

export function getEventParameters(element: Element, action: string) {
	const matches = actionAttributePattern.exec(action);

	if (matches != null) {
		const [, , , , event, , , callback, options] = matches;

		const parameters: EventParameters = {
			callback,
			options: getOptions(options ?? ''),
			type: (event ?? getType(element)) as never,
		};

		return parameters.type == null ? undefined : parameters;
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
