import {parse} from '@oscarpalmer/atoms/string';
import {camelCase} from '@oscarpalmer/atoms/string/case';
import {EVENT_CHANGE, EVENT_IGNORED, EXPRESSION_IO_ATTRIBUTE, TYPE_INPUT} from '../../constants';
import {getDataValue, replaceData} from '../../helpers/data.helper';
import type {Attribute, Context} from '../../models';
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
	attribute: Attribute,
	matches: RegExpExecArray,
	added: boolean,
): void {
	const [, type, , , property, format] = matches;

	const full = `${property}${format == null ? '' : `:${format}`}`;
	const camelCased = camelCase(property);

	handleActionAttribute(
		context,
		element,
		{
			name: `${type}:${event}.${full}`,
			type: TYPE_INPUT,
			value: '',
		},
		added,
		{
			event,
			callback: (event: Event) => {
				handleDataValue(context, event.target as never, camelCased, format);
			},
		},
	);

	handleTargetAttribute(context, element, attribute, added, `${type}.${full}`);
}

export function handleInputOutputAttribute(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
): void {
	const matches = EXPRESSION_IO_ATTRIBUTE.exec(attribute.name) as RegExpExecArray;
	const [, type, , , property, format] = matches;

	const event = getEventType(element);

	if (event == null) {
		handleTargetAttribute(
			context,
			element,
			attribute,
			added,
			`${type}.${property}${format == null ? '' : `:${format}`}`,
		);
	} else {
		handleInputAttribute(event, context, element, attribute, matches, added);
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
