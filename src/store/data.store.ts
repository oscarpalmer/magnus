import {isArrayOrPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {
	camelCase,
	getString,
	kebabCase,
	parse,
} from '@oscarpalmer/atoms/string';
import {dispatch} from '@oscarpalmer/toretto/event';
import {changeEventTypes} from '../constants';
import type {Context} from '../controller/context';

type Value = {
	original: unknown;
	stringified: string;
};

const frames: WeakMap<Context, number> = new WeakMap();

export class Data {
	readonly value: PlainObject;

	constructor(context: Context) {
		const frames: Record<string, number> = {};
		const prefix = `${context.state.name}-`;

		this.value = new Proxy(
			{},
			{
				deleteProperty(target, property) {
					return updateProperty(
						context,
						prefix,
						target,
						property,
						undefined,
						'',
						frames,
					);
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

					return updateProperty(
						context,
						prefix,
						target,
						name,
						next,
						nextAsString,
						frames,
					);
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

function setElementValue(element: Element, value: string): void {
	let event: string | undefined;

	switch (true) {
		case element === document.activeElement:
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

function setElementValues(elements: Element[], value: string): void {
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		setElementValue(elements[index], value);
	}
}

function setValue(
	context: Context,
	prefix: string,
	name: string,
	value: Value,
): void {
	cancelAnimationFrame(frames.get(context) as never);

	setElementContents(
		context.targets.getAll(`output.${name}`),
		value.stringified,
	);

	setElementValues(context.targets.getAll(`input.${name}`), value.stringified);

	const namedInputs = context.targets.getAll(`input.${name}:json`);
	const namedOutputs = context.targets.getAll(`output.${name}:json`);

	if (namedInputs.length > 0 || namedOutputs.length > 0) {
		const json = JSON.stringify(
			value.original,
			null,
			+(getComputedStyle(context.state.element)?.tabSize ?? '4'),
		);

		setElementContents(namedOutputs, json);
		setElementValues(namedInputs, json);
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
					+(getComputedStyle(context.state.element)?.tabSize ?? '4'),
				);

				setElementContents(outputs, json);
				setElementValues(inputs, json);
			}),
		);
	}
}

export function setValueFromAttribute(
	context: Context,
	name: string,
	value: string,
): void {
	if (getString(context.data.value[name]) !== value) {
		context.data.value[name] = value == null ? value : (parse(value) ?? value);
	}
}

function updateProperty(
	context: Context,
	prefix: string,
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
		setValue(context, prefix, name, {
			original,
			stringified,
		});
	});

	return true;
}
