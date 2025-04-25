import {
	controllerAttributePrefixPattern,
	dataAttributePattern,
	targetAttributePrefixPattern,
} from '../../constants';
import type {Context} from '../../controller/context';
import {parseAttribute} from '../../helpers/attribute';
import type {AttributeHandleCallback, AttributeType} from '../../models';
import {controllers} from '../../store/controller.store';
import {setValueFromAttribute} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';
import {handleInputOutputAttribute} from './input-output.attribute';

export function handleContextualAttribute(
	type: AttributeType,
	element: Element,
	name: string,
	value: string,
	added: boolean,
): void {
	const callback = callbacks[type];
	const parsed = parseAttribute(type, name, value);

	let count = 0;

	function step() {
		if (parsed == null || count >= 10) {
			return;
		}

		count += 1;

		const context = controllers.find(element, parsed.name, parsed.identifier);

		if (context == null) {
			setTimeout(step);
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
	const normalized = name.replace(controllerAttributePrefixPattern, '');

	if (controllers.has(normalized)) {
		if (added) {
			controllers.add(normalized, element);
		} else {
			controllers.remove(normalized, element);
		}
	}
}

function handleDataAttribute(
	context: Context,
	element: Element,
	property: string,
	value: string,
): void {
	setValueFromAttribute(context, property, value);

	element.removeAttribute(`${context.state.name}-${property}`);
}

export function handlaDataAttributes(context: Context): void {
	const {element, name} = context.state;

	const pattern = new RegExp(`^${name}-`);

	const attributes = [...element.attributes];
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const attribute = attributes[index];

		if (
			pattern.test(attribute.name) &&
			dataAttributePattern.test(attribute.name)
		) {
			handleDataAttribute(
				context,
				element,
				attribute.name.replace(pattern, ''),
				attribute.value,
			);
		}
	}
}

export function handleTargetAttribute(
	context: Context,
	element: Element,
	name: string,
	_: string,
	added: boolean,
): void;

export function handleTargetAttribute(
	context: Context,
	element: Element,
	name: string,
	_: string,
	added: boolean,
	removePrefix: boolean,
): void;

export function handleTargetAttribute(
	context: Context,
	element: Element,
	name: string,
	_: string,
	added: boolean,
	unprefix?: boolean,
): void {
	const normalized =
		(unprefix ?? true) ? name.replace(targetAttributePrefixPattern, '') : name;

	if (added) {
		context.targets.add(normalized, element);
	} else {
		context.targets.remove(normalized, element);
	}
}

const callbacks: Partial<Record<AttributeType, AttributeHandleCallback>> = {
	action: handleActionAttribute,
	io: handleInputOutputAttribute,
	target: handleTargetAttribute,
};
