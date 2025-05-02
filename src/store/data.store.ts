import {isArrayOrPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {camelCase, getString, parse} from '@oscarpalmer/atoms/string';
import {dispatch} from '@oscarpalmer/toretto/event';
import {changeEventTypes} from '../constants';
import type {Context} from '../controller/context';

type Value = {
	original: unknown;
	stringified: string;
};

const frames = new WeakMap<Context, number>();
const focused = new Set<string>();
const ignored = new Set<string>();

export class Data {
	readonly value: PlainObject;

	constructor(context: Context) {
		const frames: Record<string, number> = {};

		this.value = new Proxy(
			{},
			{
				deleteProperty(target, property) {
					return updateProperty(context, target, property, undefined, '', frames);
				},
				get(target, property) {
					return Reflect.get(target, camelCase(String(property)));
				},
				set(target, property, next) {
					const name = camelCase(String(property));
					const previous = Reflect.get(target, name);
					const nextAsString = getString(next);

					if (typeof previous === typeof next && getString(previous) === nextAsString) {
						return true;
					}

					return updateProperty(context, target, name, next, nextAsString, frames);
				},
			},
		);
	}
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
			changeEventTypes.has(element.type): {
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
	}

	if (event != null) {
		dispatch(element, event, {
			bubbles: true,
			cancelable: true,
		});
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
	cancelAnimationFrame(frames.get(context) as never);

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
						+(getComputedStyle(element)?.tabSize ?? '4'),
					);

		setElementContents(namedOutputs, json);
		setElementValues(namedInputs, attribute, json);
	}

	const inputs = context.targets.getAll('input.:json');
	const outputs = context.targets.getAll('output.:json');

	if (inputs.length > 0 || outputs.length > 0) {
		frames.set(
			context,
			requestAnimationFrame(() => {
				const json = JSON.stringify(
					context.data.value,
					null,
					+(getComputedStyle(element)?.tabSize ?? '4'),
				);

				setElementContents(outputs, json);
				setElementValues(inputs, attribute, json);
			}),
		);
	}
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

	if (getString(context.data.value[name]) !== getString(value)) {
		context.data.value[name] = parse(value) ?? value;
	}
}

function updateProperty(
	context: Context,
	target: PlainObject,
	property: PropertyKey,
	original: unknown,
	stringified: string,
	frames: Record<string, number>,
): boolean {
	const name = camelCase(String(property));

	if (original == null) {
		Reflect.deleteProperty(target, name);
	} else {
		Reflect.set(target, name, original);
	}

	cancelAnimationFrame(frames[name]);

	frames[name] = requestAnimationFrame(() => {
		setValue(context, name, {
			original,
			stringified,
		});
	});

	return true;
}
