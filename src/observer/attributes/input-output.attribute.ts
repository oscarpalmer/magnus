import {camelCase, parse} from '@oscarpalmer/atoms/string';
import {
	EVENT_CHANGE,
	EVENT_IGNORED,
	EXPRESSION_IO_ATTRIBUTE_PREFIX,
	EXPRESSION_JSON_SUFFIX,
} from '../../constants';
import type {Context} from '../../controller/context';
import type {AttributeHandleCallbackParameters} from '../../models';
import {getDataValue, replaceData} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';
import {handleTargetAttribute} from './target.attribute';

function getEventType(element: Element): string | undefined {
	const isInput = element instanceof HTMLInputElement;

	if ((isInput && EVENT_CHANGE.has(element.type)) || element instanceof HTMLSelectElement) {
		return 'change';
	}

	if (isInput && EVENT_IGNORED.has(element.type)) {
		return;
	}

	if (isInput || element instanceof HTMLTextAreaElement) {
		return 'input';
	}
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

function handleInputAttribute(parameters: AttributeHandleCallbackParameters): void {
	const {context, element, name, type, value, added} = parameters;

	const unprefixed = name.replace(EXPRESSION_IO_ATTRIBUTE_PREFIX, '');
	const isJson = unprefixed.endsWith(':json');
	const property = camelCase(unprefixed.replace(EXPRESSION_JSON_SUFFIX, ''));

	handleActionAttribute({
		added,
		context,
		element,
		type,
		value,
		custom: {
			callback: (event: Event) => {
				handleDataValue(context, event.target as never, property, isJson);
			},
			event: type,
		},
		name: `input:${type}.${unprefixed}`,
	});

	handleTargetAttribute(
		{
			added,
			context,
			element,
			type,
			value,
			name: `input.${unprefixed}`,
		},
		false,
	);
}

export function handleInputOutputAttribute(parameters: AttributeHandleCallbackParameters): void {
	const {added, context, element, name} = parameters;

	const type = getEventType(element);

	if (type == null) {
		handleTargetAttribute(
			{
				added,
				context,
				element,
				name: `output.${name.replace(EXPRESSION_IO_ATTRIBUTE_PREFIX, '')}`,
				type: '',
				value: '',
			},
			false,
		);
	} else {
		handleInputAttribute({
			added,
			context,
			element,
			name,
			type,
			value: name,
		});
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
