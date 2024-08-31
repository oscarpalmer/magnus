import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Context} from '../../controller/context';
import {getEventParameters} from '../../helpers/event';
import {findTarget} from '../../helpers/index';
import type {
	AttributeHandleCallbackCustomParameters,
	EventParameters,
} from '../../models';

function createAction(
	context: Context,
	element: Element,
	value: string,
	parameters: EventParameters,
	custom?: AttributeHandleCallbackCustomParameters,
): void {
	const callback =
		custom?.callback ??
		((context.controller as unknown as PlainObject)[parameters.callback] as (
			event: Event,
		) => void);

	const target =
		typeof callback === 'function'
			? parameters.external == null
				? element
				: findTarget(element, parameters.external.name, parameters.external.id)
			: null;

	if (target != null) {
		context.actions.create(
			{
				callback: callback.bind(context.controller),
				name: value,
				options: parameters.options,
				type: parameters.type,
			},
			target,
		);
	}
}

function handleAction(
	context: Context,
	element: Element,
	action: string,
	value: string,
	custom?: AttributeHandleCallbackCustomParameters,
): void {
	const parameters =
		custom?.callback == null
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

	if (parameters != null) {
		createAction(context, element, value, parameters, custom);
	}
}

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
	} else if (added) {
		handleAction(context, element, action, value, custom);
	}
}
