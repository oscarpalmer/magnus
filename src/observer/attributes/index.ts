import {join} from '@oscarpalmer/atoms/string';
import {camelCase} from '@oscarpalmer/atoms/string/case';
import {EXPRESSION_CONTROLLER_ATTRIBUTE_PREFIX} from '../../constants';
import type {Context, ParsedAttribute, ParsedAttributeType} from '../../models';
import {contexts} from '../../store/context.store';
import {controllers} from '../../store/controller.store';
import {setValueFromAttribute} from '../../store/data.store';
import {handleActionAttribute} from './action.attribute';
import {handleInputOutputAttribute} from './input-output.attribute';
import {handleTargetAttribute} from './target.attribute';

// #region Types

type AttributeHandler = (
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
) => void;

// #endregion

// #region Functions

export function handleContextualAttribute(
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
): void {
	const callback = callbacks[attribute.type];

	let count = 0;

	function step(): void {
		if (count >= 10) {
			return;
		}

		count += 1;

		const context = added
			? controllers.find(element, attribute.data.name, attribute.data.identifier)
			: contexts.get(element, attribute.data.name);

		if (context == null && added) {
			requestAnimationFrame(step);
		} else if (context != null) {
			contexts.connect(element, context);

			callback?.(context, element, attribute, added);
		}
	}

	step();
}

export function handleControllerAttribute(element: Element, name: string, added: boolean): void {
	const normalized = name.replace(EXPRESSION_CONTROLLER_ATTRIBUTE_PREFIX, '');

	if (controllers.has(normalized)) {
		if (added) {
			controllers.attach(normalized, element);
		} else {
			controllers.detach(normalized, element);
		}
	}
}

export function handleDataAttribute(element: Element, attribute: ParsedAttribute): void {
	const parts = attribute.original.name.split('-');
	const length = parts.length - 1;

	for (let index = 0; index < length; index += 1) {
		const controller = join(parts.slice(0, index + 1), delimiter);
		const context = controllers.find(element, controller);

		if (context != null) {
			setValueFromAttribute(
				context,
				camelCase(join(parts.slice(index + 1), delimiter)),
				attribute.original.value ?? '',
			);

			return;
		}
	}
}

// #endregion

// #region Variables

const callbacks: Partial<Record<ParsedAttributeType, AttributeHandler>> = {
	action: handleActionAttribute,
	input: handleInputOutputAttribute,
	output: handleInputOutputAttribute,
	target: handleTargetAttribute,
};

const delimiter = '-';

// #endregion
