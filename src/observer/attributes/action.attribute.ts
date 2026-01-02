import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {camelCase} from '@oscarpalmer/atoms/string';
import type {Context} from '../../controller/context';
import {getEventParameters} from '../../helpers/event';
import {findTarget} from '../../helpers/index';
import type {AttributeHandleCallbackParameters, EventParameters} from '../../models';

type HandleParameters = {
	added: boolean;
	callback: GenericCallback;
	context: Context;
	event: EventParameters;
	name: string;
	target: EventTarget;
	value: string;
};

type StepperParameters = {
	count: number;
	event: EventParameters;
} & AttributeHandleCallbackParameters;

//

function handle(parameters: HandleParameters): void {
	const {added, callback, context, event, name, target, value} = parameters;

	const action = `${name}${value.length === 0 ? '' : `/${value}`}`;

	if (!added) {
		context.actions.remove(action, target);

		return;
	}

	if (context.actions.has(action)) {
		context.actions.add(action, target);

		return;
	}

	context.actions.create(
		{
			callback: callback.bind(context.controller),
			name: action,
			options: event.options,
			type: event.type,
		},
		target,
	);
}

export function handleActionAttribute(parameters: AttributeHandleCallbackParameters): void {
	const {custom, element, name, value} = parameters;

	const eventParameters =
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

	if (eventParameters != null) {
		stepper({
			...parameters,
			count: 0,
			event: eventParameters,
		});
	}
}

function stepper(parameters: StepperParameters): void {
	if (parameters.count >= 10) {
		return;
	}

	parameters.count += 1;

	const {added, context, element, event, name, value, custom} = parameters;

	const callback =
		custom?.callback ??
		((context.controller as unknown as PlainObject)[event.callback] as (event: Event) => void);

	let target: EventTarget | undefined;

	if (typeof callback === 'function') {
		target =
			event.external == null
				? element
				: findTarget(element, event.external.name, event.external.identifier);
	}

	if (target == null) {
		requestAnimationFrame(() => {
			stepper(parameters);
		});
	} else {
		handle({
			added,
			callback,
			context,
			event,
			name,
			target,
			value,
		});
	}
}
