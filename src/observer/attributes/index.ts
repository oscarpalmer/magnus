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

	for (const changed of changes) {
		const added = changes.indexOf(changed) === 1;

		for (const change of changed) {
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

	for (const attribute of attributes) {
		const callback = callbacks[attribute];
		const elements = document.querySelectorAll(`[data-${attribute}]`);

		for (const element of elements) {
			const value = element.getAttribute(`data-${attribute}`);

			if (value == null || !value.toLowerCase().includes(identifier)) {
				continue;
			}

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
