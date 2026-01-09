import type {PlainObject} from '@oscarpalmer/atoms/models';
import {camelCase} from '@oscarpalmer/atoms/string';
import {getEventParameters} from '../../helpers/event.helper';
import {findTarget} from '../../helpers/index';
import type {
	ActionAttributeHandlerParameters,
	ActionAttributeStepHandlerParameters,
	AttributeHandlerCallbackParameters,
} from '../../models';

//

function handle(parameters: ActionAttributeHandlerParameters): void {
	const {context, event, target, value} = parameters;

	const action = `${parameters.name}${value.length === 0 ? '' : `/${value}`}`;

	if (!parameters.added) {
		context.actions.remove(action, target);

		return;
	}

	if (context.actions.has(action)) {
		context.actions.add(action, target);
	} else {
		context.actions.create(
			{
				callback: parameters.callback.bind(context.controller),
				name: action,
				options: event.options,
				type: event.type,
			},
			target,
		);
	}
}

export function handleActionAttribute(parameters: AttributeHandlerCallbackParameters): void {
	const {callback, event} = parameters.custom ?? {};

	const eventParameters =
		callback == null || event == null
			? getEventParameters(parameters.element, parameters.name, parameters.value)
			: {
					callback: '',
					options: {
						capture: false,
						once: false,
						passive: true,
					},
					type: camelCase(event),
				};

	if (eventParameters != null) {
		stepper({
			...parameters,
			count: 0,
			event: eventParameters,
		});
	}
}

function stepper(parameters: ActionAttributeStepHandlerParameters): void {
	if (parameters.count >= 10) {
		return;
	}

	const {element, event} = parameters;
	const {external} = event;

	const callback =
		parameters.custom?.callback ??
		((parameters.context.controller as unknown as PlainObject)[event.callback] as (
			event: Event,
		) => void);

	let target: EventTarget | undefined;

	if (typeof callback === 'function') {
		target = external == null ? element : findTarget(element, external.name, external.identifier);
	}

	if (target == null) {
		parameters.count += 1;

		requestAnimationFrame(() => {
			stepper(parameters);
		});
	} else {
		handle({...parameters, callback, target});
	}
}
