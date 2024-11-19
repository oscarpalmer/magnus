import {
	attributeCallbacks,
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
	const unprefixed = name.slice(1);

	if (controllers.has(unprefixed)) {
		controllers[added ? 'add' : 'remove'](unprefixed, element);
	} else {
		handlePossibleDataAttribute(element, unprefixed, added);
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
			element.getAttribute(`\:${controller}-${property}`) ?? '',
		);
	}
}

function handlePossibleDataAttribute(
	element: Element,
	name: string,
	added: boolean,
): void {
	const parts = name.split('-');
	const {length} = parts;

	if (parts[0] === name) {
		return;
	}

	let index = 0;

	let controller: string | undefined;
	let property: string | undefined;

	while (true) {
		controller = parts.slice(index, index + 1).join('-');
		property = parts.slice(index + 1).join('-');

		if (controllers.has(controller)) {
			handleDataAttribute(element, controller, property);
			break;
		}

		index += 1;

		if (index >= length) {
			break;
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
