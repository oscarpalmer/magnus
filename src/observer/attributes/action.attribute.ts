import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Context} from '../../controller/context';
import {getEventParameters} from '../../helpers/event';
import {findTarget} from '../../helpers/index';
import type {AttributeHandleCallbackCustomParameters} from '../../models';

export function handleActionAttribute(
	context: Context,
	element: Element,
	value: string,
	added: boolean,
	custom?: AttributeHandleCallbackCustomParameters,
): void {
	const action = custom?.event ?? value;

	if (context.actions.has(value)) {
		if (added) {
			context.actions.add(value, element);
		} else {
			context.actions.remove(value, element);
		}

		return;
	}

	if (!added) {
		return;
	}

	const parameters =
		custom?.handler == null
			? getEventParameters(element, value, context.element === element)
			: {
					callback: '',
					options: {
						capture: false,
						once: false,
						passive: true,
					},
					type: action,
				};

	if (parameters == null) {
		return;
	}

	const callback =
		custom?.handler ??
		((context.controller as unknown as PlainObject)[parameters.callback] as (
			event: Event,
		) => void);

	if (typeof callback !== 'function') {
		return;
	}

	const target =
		parameters.external == null
			? element
			: findTarget(element, parameters.external.name, parameters.external.id);

	if (target != null) {
		context.actions.create({
			callback: callback.bind(context.controller),
			name: value,
			options: parameters.options,
			type: parameters.type,
		});

		context.actions.add(value, target);
	}
}
