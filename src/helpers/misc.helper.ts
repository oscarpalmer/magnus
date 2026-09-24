import {
	EXPRESSION_DOCUMENT,
	EXPRESSION_WINDOW,
	PREFIX_CONTROLLER,
	PREFIX_INPUT,
	PREFIX_OUTPUT,
	PREFIX_TARGET,
	TYPES_FORMAT,
} from '../constants';
import type {DataFormat} from '../models';
import {controllers} from '../store/controller.store';

// #region Functions

export function findTarget(origin: Element, name: string, id?: string): EventTarget | undefined {
	const noId = id == null;

	switch (true) {
		case noId && EXPRESSION_DOCUMENT.test(name):
			return document;

		case noId && EXPRESSION_WINDOW.test(name):
			return window;

		default:
			return (
				controllers.find(origin, name, id)?.state.element ??
				(noId ? (document.getElementById(name) as EventTarget) : undefined)
			);
	}
}

function handleAttribute(
	add: boolean,
	prefix: string,
	element: Element,
	first: string,
	second?: string,
	suffix?: string,
): void {
	if (
		element instanceof Element &&
		typeof first === 'string' &&
		(second == null ? true : typeof second === 'string')
	) {
		element[add ? 'setAttribute' : 'removeAttribute'](
			`${prefix}${first}${second ? `.${second}` : ''}${suffix == null ? '' : `:${suffix}`}`,
			'',
		);
	}
}

function handleData(
	add: boolean,
	input: boolean,
	element: Element,
	first: string,
	second?: string,
	suffix?: DataFormat,
): void {
	handleAttribute(
		add,
		input ? PREFIX_INPUT : PREFIX_OUTPUT,
		element,
		first,
		second,
		TYPES_FORMAT.has(suffix as DataFormat) ? suffix : undefined,
	);
}

function removeAttribute(
	prefix: string,
	element: Element,
	first: string,
	second?: string,
	suffix?: string,
): void {
	handleAttribute(false, prefix, element, first, second, suffix);
}

/**
 * Remove a named controller attribute from an element
 *
 * @param element Element for controller
 * @param name Controller name
 */
export function removeController(element: Element, name: string) {
	removeAttribute(PREFIX_CONTROLLER, element, name);
}

/**
 * Remove a named input attribute from an element for a specific controller
 *
 * @param element Element for input
 * @param controller Controller name
 * @param name Input property
 * @param format Input format _(pretty or raw JSON)_
 */
export function removeInput(
	element: Element,
	controller: string,
	name: string,
	format?: DataFormat,
): void {
	handleData(false, true, element, controller, name, format);
}

/**
 * Remove a named output attribute from an element for a specific controller
 *
 * @param element Element for output
 * @param controller Controller name
 * @param name Output property
 * @param format Output format _(pretty or raw JSON)_
 */
export function removeOutput(
	element: Element,
	controller: string,
	name: string,
	format?: DataFormat,
): void {
	handleData(false, false, element, controller, name, format);
}

/**
 * Remove a named target attribute from an element for a specific controller
 *
 * @param element Element for target
 * @param controller Controller name
 * @param name Target name
 */
export function removeTarget(element: Element, controller: string, name: string): void {
	removeAttribute(PREFIX_TARGET, element, controller, name);
}

function setAttribute(
	prefix: string,
	element: Element,
	first: string,
	second?: string,
	suffix?: string,
): void {
	handleAttribute(true, prefix, element, first, second, suffix);
}

/**
 * Set a named controller attribute on an element
 *
 * @param element Element for controller
 * @param name Controller name
 */
export function setController(element: Element, name: string): void {
	setAttribute(PREFIX_CONTROLLER, element, name);
}

/**
 * Set a named input attribute on an element for a specific controller _(with optional formatting)_
 *
 * @param element Element for input
 * @param controller Controller name
 * @param name Input property
 * @param format Input format _(pretty or raw JSON)_
 */
export function setInput(
	element: Element,
	controller: string,
	name: string,
	format?: DataFormat,
): void {
	handleData(true, true, element, controller, name, format);
}

/**
 * Set a named output attribute on an element for a specific controller _(with optional formatting)_
 *
 * @param element Element for output
 * @param controller Controller name
 * @param name Output property
 * @param format Output format _(pretty or raw JSON)_
 */
export function setOutput(
	element: Element,
	controller: string,
	name: string,
	format?: DataFormat,
): void {
	handleData(true, false, element, controller, name, format);
}

/**
 * Set a named target attribute for an element and controller
 *
 * @param element Element for target
 * @param controller Controller name
 * @param name Target name
 */
export function setTarget(element: Element, controller: string, name: string): void {
	setAttribute(PREFIX_TARGET, element, controller, name);
}

// #endregion
