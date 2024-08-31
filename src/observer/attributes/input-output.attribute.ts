import {parse} from '@oscarpalmer/atoms/string';
import {
	changeEventTypes,
	ignoredInputTypes,
	parseableInputTypes,
} from '../../constants';
import type {Context} from '../../controller/context';
import type {DataType} from '../../models';
import {replaceData} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';
import {handleTargetElement} from './target.attribute';

function getDataType(element: Element): DataType | undefined {
	switch (true) {
		case element instanceof HTMLInputElement &&
			!ignoredInputTypes.has(element.type):
			return element.type === 'checkbox'
				? 'boolean'
				: parseableInputTypes.has(element.type)
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

function getEventType(
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
): string {
	if (
		(element instanceof HTMLInputElement &&
			changeEventTypes.has(element.type)) ||
		element instanceof HTMLSelectElement
	) {
		return 'change';
	}

	return 'input';
}

function handleDataValue(
	type: DataType,
	context: Context,
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	name: string,
	json: boolean,
): void {
	if (json) {
		const value = parse(element.value);

		if (name === '$' && element.value.trim().length > 0 && value != null) {
			replaceData(context, value);
		}

		if (value != null) {
			setDataValue(type, context, element, name, value);
		}
	} else {
		setDataValue(type, context, element, name);
	}
}

export function handleInputAttribute(
	context: Context,
	element: Element,
	value: string,
	added: boolean,
): void {
	const [key, json] = value.split(':');
	const data = getDataType(element);

	if (context != null && data != null) {
		const name = `input:${value}`;
		const event = getEventType(element as never);

		handleActionAttribute(context, element, name, added, {
			event,
			callback: event => {
				handleDataValue(data, context, event.target as never, key, json != null);
			},
		});

		handleTargetElement(context, element, name, added);
	}
}

export function handleOutputAttribute(
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
	value?: unknown,
): void {
	context.data.value[name] =
		value ??
		(type === 'boolean'
			? (element as HTMLInputElement).checked
			: type === 'parseable'
				? parse(element.value) ?? element.value
				: element.value);
}
