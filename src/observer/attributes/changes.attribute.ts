import {TYPE_ACTION, TYPE_CONTROLLER} from '../../constants';
import type {AttributeType} from '../../models';
import {handleContextualAttribute, handleControllerAttribute} from './index';

function getAttribute(element: Element, name: string): string | undefined {
	return attributes.get(element)?.get(name);
}

function getChanges(from: string, to: string): string[][] {
	const fromValues = getParts(from);
	const toValues = getParts(to);
	const attributes: string[][] = [[], []];

	for (let outer = 0; outer < 2; outer += 1) {
		const values = outer === 0 ? fromValues : toValues;
		const other = outer === 0 ? toValues : fromValues;

		const {length} = values;

		for (let inner = 0; inner < length; inner += 1) {
			const value = values[inner];

			if (!other.includes(value)) {
				attributes[outer].push(value);
			}
		}
	}

	return attributes;
}

function getParts(value: string): string[] {
	return value
		.split(whitespaceExpression)
		.map(part => part.trim())
		.filter(part => part.length > 0);
}

function handleActionAttributes(
	element: Element,
	name: string,
	from: string,
	to: string,
	removed: boolean,
): void {
	if (from === to && !removed) {
		return;
	}

	const changes = getChanges(from, to);
	const changesLength = changes.length;

	if (removed) {
		changes[0].push(to);
	}

	for (let changesIndex = 0; changesIndex < changesLength; changesIndex += 1) {
		const changed = changes[changesIndex];
		const changedLength = changed.length;
		const added = changesIndex === 1;

		for (let changedIndex = 0; changedIndex < changedLength; changedIndex += 1) {
			handleContextualAttribute({
				added,
				element,
				name,
				type: TYPE_ACTION,
				value: changed[changedIndex],
			});
		}
	}

	updateAttributes(element, name, to);
}

export function handleAttributeChanges(
	type: AttributeType,
	element: Element,
	name: string,
	value: string,
	removed: boolean,
): void {
	const previous = getAttribute(element, name);
	const current = element.getAttribute(name);

	if (
		type === TYPE_ACTION &&
		(value == null ? previous != null : (current ?? value).trim().length > 0)
	) {
		handleActionAttributes(element, name, previous ?? value, current ?? '', removed);

		if (removed) {
			attributes.delete(element);
		}

		return;
	}

	const added = !removed && current != null && value != null;

	if (type === TYPE_CONTROLLER) {
		handleControllerAttribute(element, name, added);
	} else {
		handleContextualAttribute({
			added,
			element,
			name,
			type,
			value: current ?? '',
		});
	}
}

function updateAttributes(element: Element, name: string, value: string): void {
	let elementAttributes = attributes.get(element);

	if (elementAttributes == null) {
		elementAttributes = new Map();
		attributes.set(element, elementAttributes);
	}

	if (value.length === 0) {
		elementAttributes.delete(name);
	} else {
		elementAttributes.set(name, value);
	}
}

//

const attributes: WeakMap<Element, Map<string, string>> = new WeakMap();

const whitespaceExpression = /\s+/;
