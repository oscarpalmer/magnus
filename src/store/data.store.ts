import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {camelCase} from '@oscarpalmer/atoms/string/case';
import {dispatch} from '@oscarpalmer/toretto/event';
import {EVENT_CHANGE, FORMAT_PRETTY, FORMAT_RAW, TYPE_INPUT, TYPE_OUTPUT} from '../constants';
import {getDataValue} from '../helpers/data.helper';
import type {Context, Data, DataTypes, DataUpdateParameters, DataValue} from '../models';

// #region Instances

function Data(this: any, context: Context, types: DataTypes) {
	this.focused = new Set();
	this.frames = {};
	this.ignored = new Set();
	this.types = types;

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

// #endregion

// #region Functions

export function createData(context: Context, types: DataTypes): Data {
	// @ts-expect-error All good, no worries :-)
	return new Data(context, types);
}

function setElementContent(element: Element, value: string, emit: boolean, focused: boolean): void {
	if (emit && element === document.activeElement && !focused) {
		return;
	}

	const event = updateContent(element, value);

	if (emit && event != null) {
		dispatch(element, event);
	}
}

function setElementContents(elements: Element[], value: string): void {
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		setElementContent(elements[index], value, false, false);
	}
}

function setElementValues(
	context: Context,
	elements: Element[],
	attribute: string,
	value: string,
): void {
	const updatedFocused = context.data.focused.delete(attribute);

	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		setElementContent(elements[index], value, true, updatedFocused);
	}
}

function setJson(context: Context, property: string, value: DataValue, attribute: string): void {
	const properties = [property, ''];
	const values = [value.original, context.data.value];

	for (let index = 0; index < 2; index += 1) {
		const property = properties[index];
		const value = values[index];

		const prettyInputs = context.targets.getAll(`${TYPE_INPUT}.${property}:${FORMAT_PRETTY}`);
		const prettyOutputs = context.targets.getAll(`${TYPE_OUTPUT}.${property}:${FORMAT_PRETTY}`);

		const rawInputs = context.targets.getAll(`${TYPE_INPUT}.${property}:${FORMAT_RAW}`);
		const rawOutputs = context.targets.getAll(`${TYPE_OUTPUT}.${property}:${FORMAT_RAW}`);

		if (prettyInputs.length > 0 || prettyOutputs.length > 0) {
			const pretty = value == null ? '' : JSON.stringify(value, null, '\t');

			setElementContents(prettyOutputs, pretty);
			setElementValues(context, prettyInputs, attribute, pretty);
		}

		if (rawInputs.length > 0 || rawOutputs.length > 0) {
			const raw = value == null ? '' : JSON.stringify(value, null, 0);

			setElementContents(rawOutputs, raw);
			setElementValues(context, rawInputs, attribute, raw);
		}
	}
}

function setValue(context: Context, property: string, value: DataValue): void {
	const attribute = `${context.state.name}-${property}`;

	if (context.state.element.hasAttribute(attribute)) {
		context.data.ignored.add(attribute);

		context.state.element.removeAttribute(attribute);
	}

	setElementContents(context.targets.getAll(`${TYPE_OUTPUT}.${property}`), value.stringified);

	setElementValues(
		context,
		context.targets.getAll(`${TYPE_INPUT}.${property}`),
		attribute,
		value.stringified,
	);

	setJson(context, property, value, attribute);

	context.controller.valueChanged(property, value.original);
}

export function setValueFromAttribute(context: Context, name: string, value: string): void {
	const attribute = `${context.state.name}-${name}`;

	if (context.data.ignored.has(attribute)) {
		context.data.ignored.delete(attribute);

		return;
	}

	context.data.focused.add(attribute);

	context.data.value[name] = value;
}

function updateContent(element: Element, value: string): string | undefined {
	switch (true) {
		case element instanceof HTMLInputElement && EVENT_CHANGE.has(element.type):
			return updateToggle(element, value);

		case element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement:
			return updateInput(element, value);

		case element instanceof HTMLSelectElement:
			return updateSelect(element, value);

		case true:
			break;
	}

	element.textContent = value;

	return undefined;
}

function updateInput(
	element: HTMLInputElement | HTMLTextAreaElement,
	value: string,
): string | undefined {
	if (element.value === value) {
		return undefined;
	}

	element.value = value;

	return 'input';
}

function updateProperty(parameters: DataUpdateParameters): boolean {
	const {context, name, original, stringified} = parameters;

	if (original == null) {
		Reflect.deleteProperty(parameters.target, name);
	} else {
		Reflect.set(parameters.target, name, original);
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

// #endregion
