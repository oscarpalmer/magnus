import {
	attributeCallbacks,
	controllerAttributePrefixPattern,
	targetAttributePrefixPattern,
} from '../../constants';
import type {Context} from '../../controller/context';
import {parseAttribute} from '../../helpers/attribute';
import type {AttributeType} from '../../models';
import {controllers} from '../../store/controller.store';
import {setValueFromAttribute} from '../../store/data.store';

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
	} else {
		handlePossibleDataAttribute(element, normalized);
	}
}

function handleDataAttribute(
	element: Element,
	controller: string,
	property: string,
): void {
	const context = controllers.find(element, controller);

	if (context != null) {
		setValueFromAttribute(
			context,
			property,
			element.getAttribute(`${controller}-${property}`) ?? '',
		);
	}
}

function handlePossibleDataAttribute(element: Element, name: string): void {
	const parts = name.split('-');
	const {length} = parts;

	if (length < 2) {
		return;
	}

	let index = 0;

	let controller: string | undefined;
	let property: string | undefined;

	while (index < length) {
		controller = parts.slice(index, index + 1).join('-');
		property = parts.slice(index + 1).join('-');

		if (controllers.has(controller)) {
			handleDataAttribute(element, controller, property);
			break;
		}

		index += 1;
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
