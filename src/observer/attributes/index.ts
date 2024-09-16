import {
	attributeCallbacks,
	targetAttributePrefixPattern,
} from '../../constants';
import type {Context} from '../../controller/context';
import {getAttributeType, parseAttribute} from '../../helpers/attribute';
import type {AttributeType} from '../../models';
import {controllers} from '../../store/controller.store';
import {setValueFromAttribute} from '../../store/data.store';
import {handleAttributeChanges} from './changes.attribute';

export function handleContextualAttribute(
	type: AttributeType,
	element: Element,
	name: string,
	value: string,
	added: boolean,
): void {
	const callback = attributeCallbacks[type];
	const parsed = parseAttribute(type, name, value);

	let count = 0;

	function step() {
		if (parsed == null || count >= 10) {
			return;
		}

		const context = controllers.find(element, parsed.name, parsed.identifier);

		if (context == null) {
			count += 1;

			requestAnimationFrame(step);
		} else {
			callback?.(context, element, name, value, added);
		}
	}

	step();
}

export function handleControllerAttribute(
	element: Element,
	name: string,
	added: boolean,
): void {
	controllers[added ? 'add' : 'remove'](name.slice(1), element);
}

export function handleAttributes(context: Context): void {
	const name = context.name.toLowerCase();
	const prefix = `\:${name}-`;

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

	const attributedElements = [
		...context.element.ownerDocument.querySelectorAll('*'),
	]
		.map(element => {
			const validAttributes = [];
			const {length} = element.attributes;

			for (let index = 0; index < length; index += 1) {
				const {name, value} = element.attributes[index];

				const type = getAttributeType(name);

				if (
					type != null &&
					type !== 'controller' &&
					(name.includes(context.name) || value.includes(context.name))
				) {
					validAttributes.push({
						name,
						type,
						value,
					});
				}
			}

			return {
				element,
				attributes: validAttributes,
			};
		})
		.filter(({attributes}) => attributes.length > 0);

	const elementsLength = attributedElements.length;

	for (let elementIndex = 0; elementIndex < elementsLength; elementIndex += 1) {
		const {element, attributes} = attributedElements[elementIndex];
		const attributesLength = attributes.length;

		for (
			let attributeIndex = 0;
			attributeIndex < attributesLength;
			attributeIndex += 1
		) {
			const {name, type, value} = attributes[attributeIndex];

			handleAttributeChanges(type, element, name, value, true);
		}
	}
}

export function handleTargetAttribute(
	context: Context,
	element: Element,
	name: string,
	_: string,
	added: boolean,
): void {
	context.targets[added ? 'add' : 'remove'](
		name.replace(targetAttributePrefixPattern, ''),
		element,
	);
}
