import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {camelCase} from '@oscarpalmer/atoms/string/case';
import {getEventParameters} from '../../helpers/event.helper';
import {findTarget} from '../../helpers/misc.helper';
import type {Context, EventAttributeParameters, ParsedAttribute} from '../../models';

// #region Types

type CustomAction = {
	callback: GenericCallback;
	event: string;
};

export type HandleParameters = {
	added: boolean;
	attribute: ParsedAttribute;
	callback: GenericCallback;
	context: Context;
	element: Element;
	event: EventAttributeParameters;
	target: EventTarget;
};

type Step = {
	count: number;
	custom?: CustomAction;
	event: EventAttributeParameters;
};

// #endregion

// #region Functions

function handleAction(parameters: HandleParameters): void {
	const {attribute, context, element, event, target} = parameters;
	const {name, value} = attribute.original;

	const action = `${name}${value == null || value.length === 0 ? '' : `/${value}`}`;

	if (!parameters.added) {
		context.actions.remove(action, element);

		return;
	}

	if (context.actions.has(action)) {
		context.actions.add(action, target, element);
	} else {
		context.actions.create(
			{
				callback: parameters.callback.bind(context.controller),
				name: action,
				options: event.options,
				type: event.type,
			},
			target,
			element,
		);
	}
}

export function handleActionAttribute(
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
	custom: CustomAction,
): void;

export function handleActionAttribute(
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
): void;

export function handleActionAttribute(
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
	custom?: CustomAction,
): void {
	const event =
		custom?.callback == null || custom?.event == null
			? getEventParameters(element, attribute)
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
	attribute: ParsedAttribute,
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
			attribute,
			callback,
			element,
			context,
			event,
			target,
		});
	}
}

// #endregion
