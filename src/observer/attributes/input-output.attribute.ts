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
			handler: event => {
				setDataValue(data, context, event.target as never, key, json != null);
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
	json: boolean,
): void {
	let actual: unknown;

	if (json) {
		actual = parse(element.value);

		if (name === '$' && element.value.trim().length > 0 && actual != null) {
			replaceData(context, actual);
		}

		if (actual == null) {
			return;
		}
	}

	context.data.value[name] =
		actual ??
		(type === 'boolean'
			? (element as HTMLInputElement).checked
			: type === 'parseable'
				? parse(element.value) ?? element.value
				: element.value);
}
