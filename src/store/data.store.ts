import {isArrayOrPlainObject, isPlainObject} from '@oscarpalmer/atoms/is';
import type {ArrayOrPlainObject, PlainObject} from '@oscarpalmer/atoms/models';
import {camelCase, getString, parse} from '@oscarpalmer/atoms/string';
import {dispatch} from '@oscarpalmer/toretto/event';
import {EVENT_CHANGE, EXPRESSION_TRUE} from '../constants';
import type {Context} from '../controller/context';
import type {ControllerDataType, ControllerDataTypes} from '../models';

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
				set(
					target: PlainObject,
					property: PropertyKey,
					next: unknown,
				): boolean {
					const name = camelCase(String(property));
					const previous = Reflect.get(target, name);
					const nextAsString = getString(next);

					if (
						typeof previous === typeof next &&
						getString(previous) === nextAsString
					) {
						return true;
					}

					return updateProperty({
						context,
						name,
						target,
						original: next,
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

export function getDataValue(
	type: ControllerDataType,
	original: string,
): unknown {
	switch (type) {
		case 'array':
		case 'object':
			return getObjectValue(original, type === 'array');

		case 'boolean':
			return EXPRESSION_TRUE.test(original);

		case 'number':
			return getNumberValue(original);

		default:
			return original;
	}
}

function getNumberValue(original: string): number | undefined {
	const asNumber = Number.parseFloat(original);

	return Number.isNaN(asNumber) ? undefined : asNumber;
}

function getObjectValue(original: string, array: boolean): ArrayOrPlainObject {
	const parsed = parse(original);

	if (parsed == null) {
		return array ? [] : {};
	}

	if (array) {
		return Array.isArray(parsed) ? parsed : [];
	}

	return isPlainObject(parsed) ? parsed : {};
}

export function replaceData(context: Context, value: unknown): void {
	const previous = Object.keys(context.data.value);
	const next = isArrayOrPlainObject(value) ? Object.keys(value) : [];

	for (const key of previous) {
		if (value == null || !next.includes(key)) {
			delete context.data.value[key];
		} else {
			context.data.value[key] = (value as PlainObject)[key];
		}
	}

	for (const key of next) {
		if (!previous.includes(key)) {
			const val = (value as PlainObject)[key];

			if (val != null) {
				context.data.value[key] = val;
			}
		}
	}
}

function setElementContents(elements: Element[], value: string): void {
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		const element = elements[index];

		if (element.textContent !== value) {
			element.textContent = value;
		}
	}
}

function setElementValue(
	element: Element,
	value: string,
	focused: boolean,
): void {
	let event: string | undefined;

	switch (true) {
		case element === document.activeElement && !focused:
			return;

		case element instanceof HTMLInputElement &&
			EVENT_CHANGE.has(element.type): {
			element.checked =
				element.value === value ||
				(element.type === 'checkbox' && value === 'true');

			event = 'change';

			break;
		}

		case (element instanceof HTMLInputElement ||
			element instanceof HTMLTextAreaElement) &&
			element.value !== value: {
			element.value = value;
			event = 'input';

			break;
		}

		case element instanceof HTMLSelectElement && element.value !== value: {
			const index = [...element.options].findIndex(
				option => option.value === value,
			);

			if (index > -1) {
				element.selectedIndex = index;
			}

			event = 'change';

			break;
		}

		default:
			break;
	}

	if (event != null) {
		dispatch(element, event);
	}
}

function setElementValues(
	elements: Element[],
	attribute: string,
	value: string,
): void {
	const updatedFocused = focused.delete(attribute);

	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		setElementValue(elements[index], value, updatedFocused);
	}
}

function setValue(context: Context, property: string, value: Value): void {
	const {element, name} = context.state;

	const attribute = `${name}-${property}`;

	if (element.hasAttribute(attribute)) {
		ignored.add(attribute);

		element.removeAttribute(attribute);
	}

	setElementContents(
		context.targets.getAll(`output.${property}`),
		value.stringified,
	);

	setElementValues(
		context.targets.getAll(`input.${property}`),
		attribute,
		value.stringified,
	);

	const namedInputs = context.targets.getAll(`input.${property}:json`);
	const namedOutputs = context.targets.getAll(`output.${property}:json`);

	if (namedInputs.length > 0 || namedOutputs.length > 0) {
		const json =
			value.original == null
				? ''
				: JSON.stringify(
						value.original,
						null,
						+getComputedStyle(element).tabSize,
					);

		setElementContents(namedOutputs, json);
		setElementValues(namedInputs, attribute, json);
	}

	const inputs = context.targets.getAll('input.:json');
	const outputs = context.targets.getAll('output.:json');

	if (inputs.length > 0 || outputs.length > 0) {
		const json = JSON.stringify(
			context.data.value,
			null,
			+getComputedStyle(element).tabSize,
		);

		setElementContents(outputs, json);
		setElementValues(inputs, attribute, json);
	}

	context.controller.valueChanged(property, value.original);
}

export function setValueFromAttribute(
	context: Context,
	name: string,
	value: string,
): void {
	const attribute = `${context.state.name}-${name}`;

	if (ignored.has(attribute)) {
		ignored.delete(attribute);

		return;
	}

	focused.add(attribute);

	if (
		context.data.value[name] == null ||
		getString(context.data.value[name]) !== value
	) {
		context.data.value[name] = getDataValue(context.data.types[name], value);
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

//

const focused: Set<string> = new Set();

const ignored: Set<string> = new Set();
