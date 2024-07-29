import {parse} from '@oscarpalmer/atoms/string';
import type {Context, DataType} from '../../models';
import {handleAction} from './action.attribute';
import {handleTarget, handleTargetElement} from './target.attribute';

const ignoredTypes = new Set(['button', 'image', 'submit', 'reset']);

const parseableTypes = new Set(['number', 'radio', 'range', 'week']);

function getDataType(element: Element): DataType | undefined {
	switch (true) {
		case element instanceof HTMLInputElement && !ignoredTypes.has(element.type):
			return element.type === 'checkbox'
				? 'boolean'
				: parseableTypes.has(element.type)
					? 'parseable'
					: 'string';

		case element instanceof HTMLSelectElement:
			return 'parseable';

		case element instanceof HTMLTextAreaElement:
			return 'string';

		default:
			return undefined;
	}
}

export function handleInputAttribute(
	element: Element,
	value: string,
	added: boolean,
): void {
	handleTarget('target', element, value, added, handleInput);
}

export function handleOutputAttribute(
	element: Element,
	value: string,
	added: boolean,
): void {
	handleTarget('target', element, value, added, handleOutput);
}

function handleInput(
	context: Context,
	element: Element,
	value: string,
	added: boolean,
): void {
	const type = getDataType(element);

	if (context != null && type != null) {
		const event = element instanceof HTMLSelectElement ? 'change' : 'input';
		const name = `input:${value}`;

		handleAction(context, element, name, added, {
			event,
			handler: () => {
				setDataValue(type, context, element as never, value);
			},
		});

		handleTargetElement(context, element, name, added);
	}
}

function handleOutput(
	context: Context,
	element: Element,
	value: string,
	added: boolean,
): void {
	handleTargetElement(context, element, `output:${value}`, added);
}

function setDataValue(
	type: DataType,
	context: Context,
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	name: string,
): void {
	context.data.value[name] =
		type === 'boolean'
			? (element as HTMLInputElement).checked
			: type === 'parseable'
				? parse(element.value) ?? element.value
				: element.value;
}
