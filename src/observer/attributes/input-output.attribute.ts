import {parse} from '@oscarpalmer/atoms/string';
import {handleTargetAttribute} from '.';
import {
	changeEventTypes,
	ignoredInputTypes,
	inputOutputAttributePrefixPattern,
	parseableInputTypes,
} from '../../constants';
import type {Context} from '../../controller/context';
import type {DataType} from '../../models';
import {replaceData} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';

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

function handleInputAttribute(
	context: Context,
	element: Element,
	type: DataType,
	name: string,
	value: string,
	added: boolean,
): void {
	const event = getEventType(element as never);
	const unprefixed = name.replace(inputOutputAttributePrefixPattern, '');
	const property = unprefixed.replace(/:json$/, '');

	handleActionAttribute(
		context,
		element,
		`${event}:${unprefixed}`,
		value,
		added,
		{
			event,
			callback: event => {
				handleDataValue(
					type,
					context,
					event.target as never,
					property,
					unprefixed.endsWith(':json'),
				);
			},
		},
	);

	handleTargetAttribute(context, element, `input:${unprefixed}`, value, added);
}

export function handleInputOutputAttribute(
	context: Context,
	element: Element,
	name: string,
	value: string,
	added: boolean,
): void {
	const type = getDataType(element);

	if (type == null) {
		handleTargetAttribute(
			context,
			element,
			`output:${name.replace(inputOutputAttributePrefixPattern, '')}`,
			'',
			added,
		);
	} else {
		handleInputAttribute(context, element, type, name, value, added);
	}
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
