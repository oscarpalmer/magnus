import {noop} from '@oscarpalmer/atoms/function';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {dispatch, off, on} from '@oscarpalmer/toretto/event';
import {isEventTarget} from '@oscarpalmer/toretto/is';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import {SYMBOL} from '../constants';
import type {
	Context,
	EventListenerParameters,
	Events,
	ExtendedEventTarget,
	InternalEvents,
} from '../models';

// #region Instances

function Events(this: any, context: Context): void {
	this[SYMBOL] = context;
}

Events.prototype.dispatch = dispatchEvent;
Events.prototype.off = offEvent;
Events.prototype.on = onEvent;

// #endregion

// #region Functions

export function createEvents(context: Context): Events {
	// @ts-expect-error All good, no worries :-)
	return new Events(context);
}

function dispatchEvent(
	this: InternalEvents,
	type: string,
	first?: ExtendedEventTarget | CustomEventInit,
	second?: ExtendedEventTarget,
): void {
	const firstIsOptions = isPlainObject(first);

	const target = getTarget(this[SYMBOL], (firstIsOptions ? second : first) as ExtendedEventTarget);

	if (target != null) {
		dispatch(target, type, firstIsOptions ? (first as CustomEventInit) : undefined);
	}
}

function getTarget(context: Context, target?: ExtendedEventTarget): EventTarget | null {
	if (typeof target === 'string') {
		return context.targets.find(target);
	}

	return isEventTarget(target) ? target : context.state.element;
}

function handleEvent(
	context: Context,
	parameters: EventListenerParameters,
	add: boolean,
): GenericCallback {
	const firstIsOptions = typeof parameters.first === 'boolean' || isPlainObject(parameters.first);

	const target = getTarget(
		context,
		(firstIsOptions ? parameters.second : parameters.first) as ExtendedEventTarget,
	);

	if (target == null) {
		return noop;
	}

	const options = firstIsOptions ? (parameters.first as AddEventListenerOptions) : undefined;

	return (add ? on : off)(target, parameters.type, parameters.listener, options) ?? noop;
}

function offEvent(
	this: InternalEvents,
	type: string,
	listener: EventListener,
	first?: boolean | EventListenerOptions | ExtendedEventTarget,
	second?: ExtendedEventTarget,
): void {
	handleEvent(this[SYMBOL], {listener, type, first, second}, false);
}

function onEvent(
	this: InternalEvents,
	type: string,
	listener: EventListener,
	first?: boolean | AddEventListenerOptions | ExtendedEventTarget,
	second?: ExtendedEventTarget,
): RemovableEventListener {
	return handleEvent(this[SYMBOL], {listener, type, first, second}, true);
}

// #endregion
