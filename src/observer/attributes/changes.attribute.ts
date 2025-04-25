import type {AttributeType} from '../../models';
import {handleContextualAttribute, handleControllerAttribute} from './index';

const attributes = new WeakMap<Element, Map<string, string>>();

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
		.split(/\s+/)
		.map(part => part.trim())
		.filter(part => part.length > 0);
}

function handleActionAttributes(
	element: Element,
	name: string,
	from: string,
	to: string,
): void {
	if (from === to) {
		return;
	}

	const changes = getChanges(from, to);
	const changesLength = changes.length;

	for (let changesIndex = 0; changesIndex < changesLength; changesIndex += 1) {
		const changed = changes[changesIndex];
		const changedLength = changed.length;
		const added = changesIndex === 1;

		for (
			let changedIndex = 0;
			changedIndex < changedLength;
			changedIndex += 1
		) {
			handleContextualAttribute(
				'action',
				element,
				name,
				changed[changedIndex],
				added,
			);
		}
	}

	updateAttributes(element, name, to);
}

export function handleAttributeChanges(
	type: AttributeType,
	element: Element,
	name: string,
	value: string | null,
): void {
	const previous = getAttribute(element, name);
	const current = element.getAttribute(name);

	if (
		type === 'action' &&
		(value == null ? previous != null : (current ?? value).trim().length > 0)
	) {
		handleActionAttributes(
			element,
			name,
			previous ?? value ?? '',
			current ?? '',
		);

		return;
	}

	const added = current != null && value != null;

	if (type === 'controller') {
		handleControllerAttribute(element, name, added);
	} else {
		handleContextualAttribute(type, element, name, current ?? '', added);
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
