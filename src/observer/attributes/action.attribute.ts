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
	action: string,
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
				: findTarget(
						element,
						parameters.external.name,
						parameters.external.identifier,
					)
			: null;

	if (target != null) {
		context.actions.create(
			{
				callback: callback.bind(context.controller),
				name: action,
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
	name: string,
	value: string,
	action: string,
	custom?: AttributeHandleCallbackCustomParameters,
): void {
	const parameters =
		custom?.callback == null
			? getEventParameters(element, name, value)
			: {
					callback: '',
					options: {
						capture: false,
						once: false,
						passive: true,
					},
					type: custom.event,
				};

	if (parameters != null) {
		createAction(context, element, action, parameters, custom);
	}
}

export function handleActionAttribute(
	context: Context,
	element: Element,
	name: string,
	value: string,
	added: boolean,
	custom?: AttributeHandleCallbackCustomParameters,
): void {
	const action = `${name}${value.length === 0 ? '' : `/${value}`}`;

	if (context.actions.has(value)) {
		if (added) {
			context.actions.add(value, element);
		} else {
			context.actions.remove(value, element);
		}
	} else if (added) {
		handleAction(context, element, name, value, action, custom);
	}
}
