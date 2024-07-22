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
	callbacks: Record<string, AttributeChangeCallback>;
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

export const attributeActionPattern = /^(?:(\w+)->)?(\w+)@(\w+)$/;
export const attributeTargetPattern = /^(?:(\w+)->)?(\w+)?\.(\w+)$/;

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
): void {
	const callback = parameters.callbacks[parameters.name];

	if (callback == null) {
		return;
	}

	let from = parameters.value;
	let to = parameters.element.getAttribute(parameters.name) ?? '';

	if (from === to) {
		return;
	}

	if (!parameters.added) {
		[from, to] = [to, from];
	}

	handleChanges({
		callback,
		from,
		to,
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
	const attributes = ['action', 'input', 'output', 'target'];
	const callbacks = [
		handleActionAttribute,
		handleInputAttribute,
		handleOutputAttribute,
		handleTargetAttribute,
	];
	const values = [`->${context.identifier}@`, `->${context.identifier}.`];

	for (const attribute of attributes) {
		const index = attributes.indexOf(attribute);
		const callback = callbacks[index];
		const value = index === 0 ? values[0] : values[1];

		const targets = document.querySelectorAll(
			`[data-${attribute}*="${value}"]`,
		);

		if (targets.length === 0) {
			continue;
		}

		for (const target of targets) {
			const attributes = [...target.attributes];

			for (const attribute of attributes) {
				if (attribute.value.includes(value)) {
					callback(target, '', attribute.value, true);
				}
			}
		}
	}
}
