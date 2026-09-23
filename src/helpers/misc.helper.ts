import {
	EXPRESSION_DOCUMENT,
	EXPRESSION_WINDOW,
	PREFIX_CONTROLLER,
	PREFIX_TARGET,
} from '../constants';
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
				(noId ? (document.querySelector(`#${name}`) as EventTarget) : undefined)
			);
	}
}

function removeAttribute(prefix: string, element: Element, first: string, second?: string): void {
	if (
		element instanceof Element &&
		typeof first === 'string' &&
		(second == null ? true : typeof second === 'string')
	) {
		element.removeAttribute(`${prefix}${first}${second ? `.${second}` : ''}`);
	}
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
 * Remove a named target attribute from an element for a specific controller
 *
 * @param element Element for target
 * @param controller Controller name
 * @param name Target name
 */
export function removeTarget(element: Element, controller: string, name: string): void {
	removeAttribute(PREFIX_TARGET, element, controller, name);
}

function setAttribute(prefix: string, element: Element, first: string, second?: string): void {
	if (
		element instanceof Element &&
		typeof first === 'string' &&
		(second == null ? true : typeof second === 'string')
	) {
		element.setAttribute(`${prefix}${first}${second ? `.${second}` : ''}`, '');
	}
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
 * Set a named target attributet for an element and controller
 *
 * @param element Element for target
 * @param controller Controller name
 * @param name Target name
 */
export function setTarget(element: Element, controller: string, name: string): void {
	setAttribute(PREFIX_TARGET, element, controller, name);
}

// #endregion
