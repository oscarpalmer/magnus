import type {PlainObject} from '@oscarpalmer/atoms/models';
import {camelCase} from '@oscarpalmer/atoms/string';
import type {Context} from '../../controller/context';
import {getEventParameters} from '../../helpers/event';
import {findTarget} from '../../helpers/index';
import type {AttributeHandleCallbackCustomParameters} from '../../models';

export function handleActionAttribute(
	context: Context,
	element: Element,
	name: string,
	value: string,
	added: boolean,
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
					type: camelCase(custom.event),
				};

	if (parameters == null) {
		return;
	}

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

	if (target == null) {
		return;
	}

	const action = `${name}${value.length === 0 ? '' : `/${value}`}`;

	if (added && !context.actions.has(action)) {
		context.actions.create(
			{
				callback: callback.bind(context.controller),
				name: action,
				options: parameters.options,
				type: parameters.type,
			},
			target,
		);
	} else if (added) {
		context.actions.add(action, target);
	} else {
		context.actions.remove(action, target);
	}
}
