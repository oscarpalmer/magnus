import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {camelCase} from '@oscarpalmer/atoms/string';
import type {Context} from '../../controller/context';
import {getEventParameters} from '../../helpers/event.helper';
import {findTarget} from '../../helpers/index';
import type {Attribute, EventAttributeParameters} from '../../models';

//

type CustomAction = {
	callback: GenericCallback;
	event: string;
};

export type HandleParameters = {
	added: boolean;
	callback: GenericCallback;
	context: Context;
	event: EventAttributeParameters;
	properties: HandleParametersProperties;
	target: EventTarget;
};

type HandleParametersProperties = {
	name: string;
	value: string;
};

type Step = {
	count: number;
	custom?: CustomAction;
	event: EventAttributeParameters;
};

//

function handleAction(parameters: HandleParameters): void {
	const {context, event, properties, target} = parameters;

	const action = `${properties.name}${properties.value.length === 0 ? '' : `/${properties.value}`}`;

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

export function handleActionAttribute(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
	custom: CustomAction,
): void;

export function handleActionAttribute(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
): void;

export function handleActionAttribute(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
	custom?: CustomAction,
): void {
	const event =
		custom?.callback == null || custom?.event == null
			? getEventParameters(element, attribute.name, attribute.value)
			: {
					callback: '',
					options: {
						capture: false,
						once: false,
						passive: true,
					},
					type: camelCase(custom?.event),
				};

	if (event != null) {
		stepper(context, element, attribute, added, {custom, event, count: 0});
	}
}

function stepper(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
	step: Step,
): void {
	if (step.count >= 10) {
		return;
	}

	const {custom, event} = step;
	const {external} = event;

	const callback =
		custom?.callback ?? ((context.controller as any)[event.callback] as (event: Event) => void);

	let target: EventTarget | undefined;

	if (typeof callback === 'function') {
		target = external == null ? element : findTarget(element, external.name, external.identifier);
	}

	if (target == null) {
		step.count += 1;

		requestAnimationFrame(() => {
			stepper(context, element, attribute, added, step);
		});
	} else {
		handleAction({
			added,
			callback,
			context,
			event,
			target,
			properties: attribute,
		});
	}
}
