import {isNumerical} from '@oscarpalmer/atoms/is';
import {camelCase, parse} from '@oscarpalmer/atoms/string';
import {
	changeEventTypes,
	ignoredInputTypes,
	inputOutputAttributePrefixPattern,
	numberInputTypes,
	parseableInputTypes,
} from '../../constants';
import type {Context} from '../../controller/context';
import type {DataType} from '../../models';
import {replaceData} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';
import {handleTargetAttribute} from './target.attribute';

function getDataType(element: Element): DataType | undefined {
	if (element instanceof HTMLSelectElement) {
		return 'parseable';
	}

	if (element instanceof HTMLTextAreaElement) {
		return 'string';
	}

	if (!(element instanceof HTMLInputElement)) {
		return;
	}

	switch (true) {
		case element.type === 'checkbox' && !element.hasAttribute('value'):
			return 'boolean';

		case ignoredInputTypes.has(element.type):
			return;

		case numberInputTypes.has(element.type):
			return 'number';

		case parseableInputTypes.has(element.type):
			return 'parseable';
	}

	return 'string';
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

function getInputValue(
	type: DataType,
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
): unknown {
	if (type === 'boolean') {
		return (element as HTMLInputElement).checked;
	}

	if (type === 'number') {
		return isNumerical(element.value) ? Number(element.value) : undefined;
	}

	return parse(element.value) ?? element.value;
}

function handleDataValue(
	type: DataType,
	context: Context,
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	name: string,
	json: boolean,
): void {
	if (!json) {
		setDataValue(type, context, element, name);

		return;
	}

	if (name.length === 0 && element.value.trim().length > 0) {
		replaceData(context, parse(element.value));
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
	const isJson = unprefixed.endsWith(':json');
	const property = camelCase(unprefixed.replace(/:json$/, ''));

	handleActionAttribute(
		context,
		element,
		`input:${event}.${unprefixed}`,
		value,
		added,
		{
			event,
			callback: event => {
				handleDataValue(type, context, event.target as never, property, isJson);
			},
		},
	);

	handleTargetAttribute(
		context,
		element,
		`input.${unprefixed}`,
		value,
		added,
		false,
	);
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
			`output.${name.replace(inputOutputAttributePrefixPattern, '')}`,
			'',
			added,
			false,
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
	if (
		!(
			element instanceof HTMLInputElement &&
			element.type === 'radio' &&
			!element.checked
		)
	) {
		context.data.value[name] = value ?? getInputValue(type, element);
	}
}
