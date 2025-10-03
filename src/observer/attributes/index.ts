import {camelCase} from '@oscarpalmer/atoms/string';
import {controllerAttributePrefixPattern} from '../../constants';
import {parseAttribute} from '../../helpers/attribute';
import type {AttributeHandleCallback, AttributeType} from '../../models';
import {controllers} from '../../store/controller.store';
import {setValueFromAttribute} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';
import {handleInputOutputAttribute} from './input-output.attribute';
import {handleTargetAttribute} from './target.attribute';

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

export function handleDataAttribute(element: Element, name: string): void {
	const parts = name.split('-');
	const length = parts.length - 1;

	for (let index = 0; index < length; index += 1) {
		const controller = parts.slice(0, index + 1).join('-');
		const context = controllers.find(element, controller);

		if (context != null) {
			setValueFromAttribute(
				context,
				camelCase(parts.slice(index + 1).join('-')),
				element.getAttribute(name) ?? '',
			);

			return;
		}
	}
}

//

const callbacks: Partial<Record<AttributeType, AttributeHandleCallback>> = {
	action: handleActionAttribute,
	io: handleInputOutputAttribute,
	target: handleTargetAttribute,
};
