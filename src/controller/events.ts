import {noop} from '@oscarpalmer/atoms/function';
import {isPlainObject} from '@oscarpalmer/atoms/is';
import {dispatch, off, on} from '@oscarpalmer/toretto/event';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import type {ExtendedEventTarget} from '../models';
import type {Context} from './context';

type HandleEventParameters = {
	first?: boolean | AddEventListenerOptions | ExtendedEventTarget;
	listener: EventListener;
	second?: ExtendedEventTarget;
	type: string;
};

export class Events {
	constructor(private readonly context: Context) {}

	/**
	 * Dispatch an event for the controller
	 */
	dispatch<Type extends keyof HTMLElementEventMap>(type: Type): void;

	/**
	 * Dispatch an event for the controller
	 */
	dispatch(type: string): void;

	/**
	 * - Dispatch an event for a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	dispatch<Type extends keyof HTMLElementEventMap>(
		type: Type,
		target: ExtendedEventTarget,
	): void;

	/**
	 * - Dispatch an event for a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	dispatch(type: string, target: ExtendedEventTarget): void;

	/**
	 * - Dispatch an event with specific options
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - It target is not provided, the controller's element will be used
	 */
	dispatch<Type extends keyof HTMLElementEventMap>(
		type: Type,
		options: CustomEventInit,
		target?: ExtendedEventTarget,
	): void;

	/**
	 * - Dispatch an event with specific options
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - It target is not provided, the controller's element will be used
	 */
	dispatch(
		type: string,
		options?: CustomEventInit,
		target?: ExtendedEventTarget,
	): void;

	dispatch(
		type: string,
		first?: ExtendedEventTarget | CustomEventInit,
		second?: ExtendedEventTarget,
	): void {
		const firstIsOptions = isPlainObject(first);

		const target = getTarget(
			this.context,
			(firstIsOptions ? second : first) as ExtendedEventTarget,
		);

		if (target != null) {
			dispatch(target, type, firstIsOptions ? (first as CustomEventInit) : undefined);
		}
	}

	/**
	 * Remove an event listener from the controller's element
	 */
	off<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
	): void;

	/**
	 * Remove an event listener from the controller's element
	 */
	off(type: string, listener: EventListener): void;

	/**
	 * - Remove an event listener from a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	off<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
		target: ExtendedEventTarget,
	): void;

	/**
	 * - Remove an event listener from a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	off(type: string, listener: EventListener, target: ExtendedEventTarget): void;

	/**
	 * - Remove an event listener from a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	off<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
		options: boolean | EventListenerOptions,
		target?: ExtendedEventTarget,
	): void;

	/**
	 * - Remove an event listener from a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	off(
		type: string,
		listener: EventListener,
		options: boolean | EventListenerOptions,
		target?: ExtendedEventTarget,
	): void;

	off(
		type: string,
		listener: EventListener,
		first?: boolean | EventListenerOptions | ExtendedEventTarget,
		second?: ExtendedEventTarget,
	): void {
		handleEvent(this.context, {listener, type, first, second}, false);
	}

	/**
	 * - Add an event listener to the controller's element
	 * ---
	 * - Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
	): RemovableEventListener;

	/**
	 * - Add an event listener to the controller's element
	 * ---
	 * - Returns a function that removes the event listener
	 */
	on(type: string, listener: EventListener): RemovableEventListener;

	/**
	 * - Add an event listener to a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
		target: ExtendedEventTarget,
	): RemovableEventListener;

	/**
	 * - Add an event listener to a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on(
		type: string,
		listener: EventListener,
		target: ExtendedEventTarget,
	): RemovableEventListener;

	/**
	 * - Add an event listener to a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
		options: boolean | AddEventListenerOptions,
		target?: ExtendedEventTarget,
	): RemovableEventListener;

	/**
	 * - Add an event listener to a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on(
		type: string,
		listener: EventListener,
		options: boolean | AddEventListenerOptions,
		target?: ExtendedEventTarget,
	): RemovableEventListener;

	on(
		type: string,
		listener: EventListener,
		first?: boolean | AddEventListenerOptions | ExtendedEventTarget,
		second?: ExtendedEventTarget,
	): RemovableEventListener {
		return handleEvent(this.context, {listener, type, first, second}, true);
	}
}

function getTarget(
	context: Context,
	target?: ExtendedEventTarget,
): EventTarget | undefined {
	if (typeof target === 'string') {
		return context.targets.get(target);
	}

	return target instanceof EventTarget ||
		(target as unknown as Document)?.documentElement instanceof Element ||
		(target != null && (target as Window).window === (target as Window))
		? target
		: context.element;
}

function handleEvent(
	context: Context,
	parameters: HandleEventParameters,
	add: boolean,
) {
	const firstIsOptions =
		typeof parameters.first === 'boolean' || isPlainObject(parameters.first);

	const target = getTarget(
		context,
		(firstIsOptions
			? parameters.second
			: parameters.first) as ExtendedEventTarget,
	);

	if (target == null) {
		return noop;
	}

	const options = firstIsOptions
		? (parameters.first as AddEventListenerOptions)
		: undefined;

	return (
		(add ? on : off)(target, parameters.type, parameters.listener, options) ??
		noop
	);
}
