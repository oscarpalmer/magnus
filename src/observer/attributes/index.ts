import {attributeTypes, attributeTypesLength} from '../../constants';
import type {Context} from '../../controller/context';
import {controllers} from '../../store/controller.store';
import {setValueFromAttribute} from '../../store/data.store';
import {handleAttributeChanges} from '../changes.attribute';

export function handleControllerAttribute(
	element: Element,
	value: string,
	added: boolean,
): void {
	if (added) {
		controllers.add(value, element);
	} else {
		controllers.remove(value, element);
	}
}

export function handleAttributes(context: Context): void {
	const name = context.name.toLowerCase();
	const prefix = `data-${name}-`;

	const attributes = [...context.element.attributes].filter(attribute =>
		attribute.name.startsWith(prefix),
	);

	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const attribute = attributes[index];

		setValueFromAttribute(
			context,
			attribute.name.slice(prefix.length),
			attribute.value,
		);
	}

	for (let typeIndex = 0; typeIndex < attributeTypesLength; typeIndex += 1) {
		const type = attributeTypes[typeIndex];
		const elements = document.querySelectorAll(`[data-${type}*="${name}"]`);
		const {length} = elements;

		for (let elementIndex = 0; elementIndex < length; elementIndex += 1) {
			const element = elements[elementIndex];
			const value = element.getAttribute(`data-${type}`);

			if (value != null) {
				handleAttributeChanges(
					type,
					{
						element,
						value,
						added: true,
						handler: undefined,
						name: '',
					},
					true,
				);
			}
		}
	}
}
