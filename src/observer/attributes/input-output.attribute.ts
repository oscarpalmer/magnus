import {parse} from '@oscarpalmer/atoms/string';
import {camelCase} from '@oscarpalmer/atoms/string/case';
import {
	EVENT_CHANGE,
	EXPRESSION_IO_ATTRIBUTE_PREFIX,
	EXPRESSION_JSON_SUFFIX,
} from '../../constants';
import type {Context} from '../../controller/context';
import {getDataValue, replaceData} from '../../helpers/data.helper';
import type {Attribute} from '../../models';
import {handleActionAttribute} from './action.attribute';
import {handleTargetAttribute} from './target.attribute';

function getEventType(element: Element): string | undefined {
	const isInput = element instanceof HTMLInputElement;

	if ((isInput && EVENT_CHANGE.has(element.type)) || element instanceof HTMLSelectElement) {
		return 'change';
	}

	if (isInput && ignoredEvent.has(element.type)) {
		return;
	}

	return isInput || element instanceof HTMLTextAreaElement ? 'input' : undefined;
}

function handleDataValue(
	context: Context,
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	name: string,
	json: boolean,
): void {
	if (!json) {
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
	attribute: Attribute,
	added: boolean,
): void {
	const unprefixed = attribute.name.replace(EXPRESSION_IO_ATTRIBUTE_PREFIX, '');
	const isJson = EXPRESSION_JSON_SUFFIX.test(unprefixed);
	const property = camelCase(unprefixed.replace(EXPRESSION_JSON_SUFFIX, ''));

	handleActionAttribute(
		context,
		element,
		{
			name: `input:${event}.${unprefixed}`,
			type: 'io',
			value: '',
		},
		added,
		{
			event,
			callback: (event: Event) => {
				handleDataValue(context, event.target as never, property, isJson);
			},
		},
	);

	handleTargetAttribute(context, element, attribute, added, `input.${unprefixed}`);
}

export function handleInputOutputAttribute(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
): void {
	const event = getEventType(element);

	if (event == null) {
		handleTargetAttribute(
			context,
			element,
			attribute,
			added,
			`output.${attribute.name.replace(EXPRESSION_IO_ATTRIBUTE_PREFIX, '')}`,
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

//

const ignoredEvent = new Set(['button', 'image', 'reset', 'submit']);
