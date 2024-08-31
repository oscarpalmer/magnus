import {inputAndOutputAttributePattern, strictTypes} from '../../constants';
import type {
	AttributeChangesParameters,
	AttributeHandleParameters,
	AttributeType,
} from '../../models';
import {handleTargetAttribute} from './target.attribute';

function getAttributeValue(element: Element, type: AttributeType): string {
	const attribute = element.getAttribute(`data-${type}`) ?? '';

	return strictTypes.has(type)
		? attribute
				.split(/\s+/g)
				.find(part => inputAndOutputAttributePattern.test(part)) ?? ''
		: attribute;
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
	parameters: AttributeHandleParameters,
	initial: boolean,
): void {
	const from = initial ? '' : parameters.value;

	const to = initial
		? parameters.value
		: getAttributeValue(parameters.element, type);

	if (from !== to) {
		handleChanges(type, {
			from,
			to,
			callback: parameters.callback,
			element: parameters.element,
			name: `data-${type}`,
		});
	}
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
			if (parameters.callback == null) {
				handleTargetAttribute(
					type,
					parameters.element,
					changed[changedIndex],
					added,
				);
			} else {
				parameters.callback(parameters.element, changed[changedIndex], added);
			}
		}
	}
}
