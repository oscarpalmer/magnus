import type {PlainObject} from '@oscarpalmer/atoms/models';
import {camelCase, getString} from '@oscarpalmer/atoms/string';
import {dispatch} from '@oscarpalmer/toretto/event';
import {EVENT_CHANGE} from '../constants';
import type {Context} from '../controller/context';
import {getDataValue} from '../helpers/data.helper';
import type {ControllerDataTypes} from '../models';

export class Data {
	readonly frames: Record<string, number | undefined> = {};
	readonly value: PlainObject;

	constructor(
		context: Context,
		readonly types: ControllerDataTypes,
	) {
		this.value = new Proxy(
			{},
			{
				deleteProperty(target: PlainObject, property: PropertyKey): boolean {
					const name = camelCase(String(property));

					return updateProperty({
						context,
						name,
						target,
						stringified: '',
					});
				},
				get(target: PlainObject, property: PropertyKey): unknown {
					return Reflect.get(target, camelCase(String(property)));
				},
				set(target: PlainObject, property: PropertyKey, value: unknown): boolean {
					const name = camelCase(String(property));
					const type = types[name];

					const previous = Reflect.get(target, name);
					const previousAsString = getString(previous);

					const nextValue = getDataValue(type, value);
					const nextAsString = getString(nextValue);

					if (typeof previous === typeof nextValue && previousAsString === nextAsString) {
						return true;
					}

					return updateProperty({
						context,
						name,
						target,
						original: nextValue,
						stringified: nextAsString,
					});
				},
			},
		);
	}
}

type UpdatePropertyParameters = {
	context: Context;
	name: string;
	original?: unknown;
	stringified: string;
	target: PlainObject;
};

type Value = {
	original?: unknown;
	stringified: string;
};

//

function setElementContents(elements: Element[], value: string): void {
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		const element = elements[index];

		if (element.textContent !== value) {
			element.textContent = value;
		}
	}
}

function setElementValue(element: Element, value: string, focused: boolean): void {
	let event: string | undefined;

	switch (true) {
		case element === document.activeElement && !focused:
			return;

		case element instanceof HTMLInputElement && EVENT_CHANGE.has(element.type):
			event = updateToggle(element, value);
			break;

		case element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement:
			event = updateInput(element, value);
			break;

		case element instanceof HTMLSelectElement:
			event = updateSelect(element, value);
			break;
	}

	if (event != null) {
		dispatch(element, event);
	}
}

function setElementValues(elements: Element[], attribute: string, value: string): void {
	const updatedFocused = focused.delete(attribute);

	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		setElementValue(elements[index], value, updatedFocused);
	}
}

function setJson(context: Context, property: string, value: Value, attribute: string): void {
	const {element} = context.state;

	const properties = [property, ''];
	const values = [value.original, context.data.value];

	for (let index = 0; index < 2; index += 1) {
		const property = properties[index];
		const value = values[index];

		const inputs = context.targets.getAll(`input.${property}:json`);
		const outputs = context.targets.getAll(`output.${property}:json`);

		if (inputs.length === 0 && outputs.length === 0) {
			continue;
		}

		const json =
			value == null ? '' : JSON.stringify(value, null, +getComputedStyle(element).tabSize);

		setElementContents(outputs, json);
		setElementValues(inputs, attribute, json);
	}
}

function setValue(context: Context, property: string, value: Value): void {
	const {element, name} = context.state;

	const attribute = `${name}-${property}`;

	if (element.hasAttribute(attribute)) {
		ignored.add(attribute);

		element.removeAttribute(attribute);
	}

	setElementContents(context.targets.getAll(`output.${property}`), value.stringified);
	setElementValues(context.targets.getAll(`input.${property}`), attribute, value.stringified);

	setJson(context, property, value, attribute);

	context.controller.valueChanged(property, value.original);
}

export function setValueFromAttribute(context: Context, name: string, value: string): void {
	const attribute = `${context.state.name}-${name}`;

	if (ignored.has(attribute)) {
		ignored.delete(attribute);

		return;
	}

	focused.add(attribute);

	context.data.value[name] = value;
}

function updateInput(
	element: HTMLInputElement | HTMLTextAreaElement,
	value: string,
): string | undefined {
	if (element.value !== value) {
		element.value = value;

		return 'input';
	}
}

function updateProperty(parameters: UpdatePropertyParameters): boolean {
	const {context, name, original, stringified, target} = parameters;

	if (original == null) {
		Reflect.deleteProperty(target, name);
	} else {
		Reflect.set(target, name, original);
	}

	const frame = context.data.frames[name];

	if (frame != null) {
		cancelAnimationFrame(frame);
	}

	context.data.frames[name] = requestAnimationFrame(() => {
		context.data.frames[name] = undefined;

		setValue(context, name, {
			original,
			stringified,
		});
	});

	return true;
}

function updateSelect(element: HTMLSelectElement, value: string): string | undefined {
	const index = [...element.options].findIndex(option => option.value === value);

	if (index > -1) {
		element.selectedIndex = index;
	}

	return 'change';
}

function updateToggle(element: HTMLInputElement, value: string): string | undefined {
	element.checked = element.value === value || (element.type === 'checkbox' && value === 'true');

	return 'change';
}

//

const focused: Set<string> = new Set();

const ignored: Set<string> = new Set();
