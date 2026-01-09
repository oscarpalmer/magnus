import {camelCase} from '@oscarpalmer/atoms/string';
import {EXPRESSION_CONTROLLER_ATTRIBUTE_PREFIX} from '../../constants';
import {parseAttribute} from '../../helpers/attribute.helper';
import type {
	AttributeHandlerCallback,
	AttributeType,
	ContextualAttributeHandlerParameters,
} from '../../models';
import {contexts} from '../../store/context.store';
import {controllers} from '../../store/controller.store';
import {setValueFromAttribute} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';
import {handleInputOutputAttribute} from './input-output.attribute';
import {handleTargetAttribute} from './target.attribute';

export function handleContextualAttribute(parameters: ContextualAttributeHandlerParameters): void {
	const {added, element, type} = parameters;

	const callback = callbacks[type];
	const parsed = parseAttribute(type, parameters.name, parameters.value);

	let count = 0;

	function step(): void {
		if (parsed == null || count >= 10) {
			return;
		}

		count += 1;

		const context = added
			? controllers.find(element, parsed.name, parsed.identifier)
			: contexts.get(element, parsed.name);

		if (context == null && added) {
			requestAnimationFrame(step);
		} else if (context != null) {
			contexts.connect(element, context);

			callback?.({...parameters, context});
		}
	}

	step();
}

export function handleControllerAttribute(element: Element, name: string, added: boolean): void {
	const normalized = name.replace(EXPRESSION_CONTROLLER_ATTRIBUTE_PREFIX, '');

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
		const controller = parts.slice(0, index + 1).join(delimiter);
		const context = controllers.find(element, controller);

		if (context != null) {
			setValueFromAttribute(
				context,
				camelCase(parts.slice(index + 1).join(delimiter)),
				element.getAttribute(name) ?? '',
			);

			return;
		}
	}
}

//

const callbacks: Partial<Record<AttributeType, AttributeHandlerCallback>> = {
	action: handleActionAttribute,
	io: handleInputOutputAttribute,
	target: handleTargetAttribute,
};

const delimiter = '-';
