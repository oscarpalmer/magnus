import type {Context} from '../../controller/context';
import {addController, removeController} from '../../store/controller.store';
import {handleActionAttribute} from './action.attribute';
import {
	handleInputAttribute,
	handleOutputAttribute,
	handleTargetAttribute,
} from './target.attribute';

export type AttributeChangeCallback = (
	element: Element,
	name: string,
	value: string,
	added: boolean,
) => void;

export type AttributeHandleCallback = (
	context: Context,
	element: Element,
	name: string,
	value: string,
	added: boolean,
	handler?: (event: Event) => void,
) => void;

export type AttributeHandleParameters = {
	added: boolean;
	callback: AttributeChangeCallback;
	element: Element;
	name: string;
	value: string;
};

export type AttributeChangesParameters = {
	callback: AttributeChangeCallback;
	element: Element;
	from: string;
	name: string;
	to: string;
};

const attributes = ['action', 'input', 'output', 'target'];

const attributesLength = attributes.length;

const callbacks: Record<string, AttributeChangeCallback> = {
	action: handleActionAttribute,
	input: handleInputAttribute,
	output: handleOutputAttribute,
	target: handleTargetAttribute,
};

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
	parameters: AttributeHandleParameters,
	initial: boolean,
): void {
	if (parameters.callback == null) {
		return;
	}

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

	handleChanges({
		from,
		to,
		callback: parameters.callback,
		element: parameters.element,
		name: parameters.name,
	});
}

function handleChanges(parameters: AttributeChangesParameters): void {
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
			const change = changed[changedIndex];

			parameters.callback(parameters.element, parameters.name, change, added);
		}
	}
}

export function handleControllerAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	if (added) {
		addController(value, element);
	} else {
		removeController(value, element);
	}
}

export function handleAttributes(context: Context): void {
	const identifier = context.identifier.toLowerCase();

	for (
		let attributeIndex = 0;
		attributeIndex < attributesLength;
		attributeIndex += 1
	) {
		const attribute = attributes[attributeIndex];
		const callback = callbacks[attribute];
		const elements = document.querySelectorAll(`[data-${attribute}]`);
		const {length} = elements;

		for (let elementIndex = 0; elementIndex < length; elementIndex += 1) {
			const element = elements[elementIndex];
			const value = element.getAttribute(`data-${attribute}`);

			if (value?.toLowerCase().includes(identifier)) {
				handleAttributeChanges(
					{
						callback,
						element,
						value,
						added: true,
						name: '',
					},
					true,
				);
			}
		}
	}
}
