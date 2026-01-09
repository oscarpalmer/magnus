import {camelCase, parse} from '@oscarpalmer/atoms/string';
import {
	EVENT_CHANGE,
	EXPRESSION_IO_ATTRIBUTE_PREFIX,
	EXPRESSION_JSON_SUFFIX,
} from '../../constants';
import type {Context} from '../../controller/context';
import {getDataValue, replaceData} from '../../helpers/data.helper';
import type {AttributeHandlerCallbackParameters} from '../../models';
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

function handleInputAttribute(parameters: AttributeHandlerCallbackParameters): void {
	const {type} = parameters;

	const unprefixed = parameters.name.replace(EXPRESSION_IO_ATTRIBUTE_PREFIX, '');
	const isJson = EXPRESSION_JSON_SUFFIX.test(unprefixed);
	const property = camelCase(unprefixed.replace(EXPRESSION_JSON_SUFFIX, ''));

	handleActionAttribute({
		...parameters,
		custom: {
			callback: (event: Event) => {
				handleDataValue(parameters.context, event.target as never, property, isJson);
			},
			event: type,
		},
		name: `input:${type}.${unprefixed}`,
	});

	handleTargetAttribute({...parameters, name: `input.${unprefixed}`}, false);
}

export function handleInputOutputAttribute(parameters: AttributeHandlerCallbackParameters): void {
	const {name} = parameters;

	const type = getEventType(parameters.element);

	if (type == null) {
		handleTargetAttribute(
			{
				...parameters,
				name: `output.${name.replace(EXPRESSION_IO_ATTRIBUTE_PREFIX, '')}`,
				type: '',
				value: '',
			},
			false,
		);
	} else {
		handleInputAttribute({...parameters, type, value: name});
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
