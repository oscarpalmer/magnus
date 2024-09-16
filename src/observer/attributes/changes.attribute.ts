import type {AttributeType} from '../../models';
import {handleContextualAttribute, handleControllerAttribute} from './index';

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
	value: string,
	initial: boolean,
): void {
	const from = initial ? null : value;
	const to = initial ? value : element.getAttribute(name);

	if (type === 'action' && value.length > 0) {
		handleChanges(type, element, name, from ?? '', to ?? '');
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
		const added = changes.indexOf(changed) === 1;
		const changedLength = changed.length;

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
}
