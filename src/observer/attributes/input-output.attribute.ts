import {parse} from '@oscarpalmer/atoms/string';
import {camelCase} from '@oscarpalmer/atoms/string/case';
import {EVENT_CHANGE, EVENT_IGNORED, TYPE_OUTPUT} from '../../constants';
import {getDataValue, replaceData} from '../../helpers/data.helper';
import type {Context, ParsedAttribute} from '../../models';
import {handleActionAttribute} from './action.attribute';
import {handleTargetAttribute} from './target.attribute';

// #region Functions

function getEventType(element: Element): string | undefined {
	const isInput = element instanceof HTMLInputElement;

	if ((isInput && EVENT_CHANGE.has(element.type)) || element instanceof HTMLSelectElement) {
		return 'change';
	}

	if (isInput && EVENT_IGNORED.has(element.type)) {
		return;
	}

	return isInput || element instanceof HTMLTextAreaElement ? 'input' : undefined;
}

function handleDataValue(
	context: Context,
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	name: string,
	format?: string,
): void {
	if (format == null) {
		setDataValue(context, element, name);

		return;
	}

	if (name.length === 0 && element.value.trim().length > 0) {
		replaceData(context, parse(element.value));
	} else {
		setDataValue(context, element, name);
	}
}

function handleInputAttribute(
	event: string,
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
): void {
	const [, , , property, format] = attribute.matches[0];

	const formatted = format == null ? '' : `:${format}`;
	const full = `${property}${formatted}`;
	const camelCased = camelCase(property);

	handleActionAttribute(
		context,
		element,
		{
			...attribute,
			original: {
				name: `${attribute.type}:${event}.${full}`,
				value: '',
			},
		},
		added,
		{
			event,
			callback: (event: Event) => {
				handleDataValue(context, event.target as never, camelCased, format);
			},
		},
	);

	handleTargetAttribute(context, element, attribute, added, `${attribute.type}.${full}`);
}

export function handleInputOutputAttribute(
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
): void {
	const event = getEventType(element);

	if (event == null || attribute.type === TYPE_OUTPUT) {
		const [, , , property, format] = attribute.matches[0];

		const formatted = format == null ? '' : `:${format}`;

		handleTargetAttribute(
			context,
			element,
			attribute,
			added,
			`${attribute.type}.${property}${formatted}`,
		);
	} else {
		handleInputAttribute(event, context, element, attribute, added);
	}
}

function setDataValue(
	context: Context,
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	name: string,
	value?: string,
): void {
	if (element.type === 'radio' && !(element as HTMLInputElement).checked) {
		return;
	}

	context.data.value[name] =
		element instanceof HTMLInputElement && element.type === 'checkbox'
			? element.checked
			: getDataValue(context.data.types[name], value ?? element.value);
}

// #endregion
