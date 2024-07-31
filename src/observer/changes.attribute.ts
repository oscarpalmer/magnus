import type {
	AttributeChangesParameters,
	AttributeHandleParameters,
	AttributeType,
} from '../models';
import {handleTargetAttribute} from './attributes/target.attribute';

function getChanges(from: string, to: string): string[][] {
	const fromValues = from
		.split(/\s+/)
		.map(part => part.trim())
		.filter(part => part.length > 0);

	const toValues = to
		.split(/\s+/)
		.map(part => part.trim())
		.filter(part => part.length > 0);

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

export function handleAttributeChanges(
	type: AttributeType,
	parameters: AttributeHandleParameters,
	initial: boolean,
): void {
	let from = initial ? '' : parameters.value;

	let to = initial
		? parameters.value
		: parameters.element.getAttribute(parameters.name) ?? '';

	if (from === to) {
		return;
	}

	if (!parameters.added) {
		[from, to] = [to, from];
	}

	handleChanges(type, {
		from,
		to,
		element: parameters.element,
		handler: parameters.handler,
		name: parameters.name,
	});
}

function handleChanges(
	type: AttributeType,
	parameters: AttributeChangesParameters,
): void {
	const changes = getChanges(parameters.from, parameters.to);
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
			if (parameters.handler == null) {
				handleTargetAttribute(
					type,
					parameters.element,
					changed[changedIndex],
					added,
				);
			} else {
				parameters.handler(parameters.element, changed[changedIndex], added);
			}
		}
	}
}
