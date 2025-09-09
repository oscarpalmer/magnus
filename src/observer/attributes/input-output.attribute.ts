import {camelCase, parse} from '@oscarpalmer/atoms/string';
import {
	changeEventTypes,
	ignoredInputTypes,
	inputOutputAttributePrefixPattern,
} from '../../constants';
import type {Context} from '../../controller/context';
import {getDataValue, replaceData} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';
import {handleTargetAttribute} from './target.attribute';
import { ControllerDataType } from '../../models';

function getDataType(element: Element): string | undefined {
	if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
		return 'string';
	}

	return element instanceof HTMLInputElement &&
		!ignoredInputTypes.has(element.type)
		? element.type === 'checkbox'
			? 'boolean'
			: 'string'
		: undefined;
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
	type: string,
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
	type: string,
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
	type: string,
	context: Context,
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	name: string,
	value?: string,
): void {
	if (
		!(
			element instanceof HTMLInputElement &&
			element.type === 'radio' &&
			!element.checked
		)
	) {
		context.data.value[name] =
			type === 'boolean'
				? (element as HTMLInputElement).checked
				: getDataValue(context.data.types[name], value ?? element.value);
	}
}
