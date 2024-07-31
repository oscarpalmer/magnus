import {parse} from '@oscarpalmer/atoms/string';
import {ignoredInputTypes, parseableInputTypes} from '../../constants';
import type {Context} from '../../controller/context';
import type {DataType} from '../../models';
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

export function handleInputAttribute(
	context: Context,
	element: Element,
	value: string,
	added: boolean,
): void {
	const type = getDataType(element);

	if (context != null && type != null) {
		const event = element instanceof HTMLSelectElement ? 'change' : 'input';
		const name = `input:${value}`;

		handleActionAttribute(context, element, name, added, {
			event,
			handler: () => {
				setDataValue(type, context, element as never, value);
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
): void {
	context.data.value[name] =
		type === 'boolean'
			? (element as HTMLInputElement).checked
			: type === 'parseable'
				? parse(element.value) ?? element.value
				: element.value;
}
