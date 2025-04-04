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
		const other = outer === 1 ? fromValues : toValues;

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

export function handleAttributeChanges(
		type: AttributeType,
		element: Element,
		name: string,
		value: string | null,
	): void {
		const to = element.getAttribute(name);

		if (
			type === 'action' &&
			((value?.length ?? 0) > 0 || hasAttribute(element, name))
		) {
			handleChanges(
				type,
				element,
				name,
				value ?? getAttribute(element, name) ?? '',
				to ?? '',
			);
		} else if (type === 'controller') {
			handleControllerAttribute(element, name, to != null);
		} else {
			handleContextualAttribute(type, element, name, to ?? '', to != null);
		}
	}

function handleChanges(
	type: AttributeType,
	element: Element,
	name: string,
	from: string,
	to: string,
): void {
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
				type,
				element,
				name,
				changed[changedIndex],
				added,
			);
		}
	}

	updateAttributes(element, name, to);
}

function hasAttribute(element: Element, name: string): boolean {
	return attributes.get(element)?.has(name) ?? false;
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
