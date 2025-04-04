import type {PlainObject} from '@oscarpalmer/atoms/models';
import {camelCase} from '@oscarpalmer/atoms/string';
import type {Context} from '../../controller/context';
import {getEventParameters} from '../../helpers/event';
import {findTarget} from '../../helpers/index';
import type {
	AttributeHandleCallbackCustomParameters,
	EventExternal,
	EventParameters,
} from '../../models';

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

	let count = 0;

	function step() {
		if (count >= 10) {
			return;
		}

		count += 1;

		const callback =
			custom?.callback ??
			((context.controller as unknown as PlainObject)[
				(parameters as EventParameters).callback
			] as (event: Event) => void);

		const target =
			typeof callback === 'function'
				? (parameters as EventParameters).external == null
					? element
					: findTarget(
							element,
							((parameters as EventParameters).external as EventExternal).name,
							((parameters as EventParameters).external as EventExternal)
								.identifier,
						)
				: null;

		if (target == null) {
			setTimeout(step);

			return;
		}

		const action = `${name}${value.length === 0 ? '' : `/${value}`}`;

		if (added && !context.actions.has(action)) {
			context.actions.create(
				{
					callback: callback.bind(context.controller),
					name: action,
					options: (parameters as EventParameters).options,
					type: (parameters as EventParameters).type,
				},
				target,
			);
		} else if (added) {
			context.actions.add(action, target);
		} else {
			context.actions.remove(action, target);
		}
	}

	step();
}
