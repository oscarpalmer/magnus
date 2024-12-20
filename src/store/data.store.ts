import {
	isArrayOrPlainObject,
	isNullableOrWhitespace,
} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {
	camelCase,
	getString,
	kebabCase,
	parse,
} from '@oscarpalmer/atoms/string';
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
		const prefix = `\:${context.name}-`;

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

					if (getString(previous) === nextAsString) {
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
	const previous = Object.keys(context.data.value).filter(
		key => key.length > 0,
	);

	const next = isArrayOrPlainObject(value)
		? Object.keys(value).filter(key => key.length > 0)
		: [];

	for (const key of previous) {
		if (value == null || !next.includes(key)) {
			delete context.data.value[key];
		} else {
			context.data.value[key] = next.includes(key)
				? (value as PlainObject)[key]
				: undefined;
		}
	}

	for (const key of next) {
		const val = (value as PlainObject)[key];

		if (!previous.includes(key) && val != null) {
			context.data.value[key] = (value as PlainObject)[key];
		}
	}
}

function setAttribute(element: Element, name: string, value: Value): void {
	if (isNullableOrWhitespace(value.original)) {
		element.removeAttribute(name);
	} else {
		element.setAttribute(name, value.stringified);
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
	switch (true) {
		case element === document.activeElement:
			return;

		case element instanceof HTMLInputElement &&
			changeEventTypes.has(element.type):
			element.checked =
				element.value === value ||
				(element.type === 'checkbox' && value === 'true');
			return;

		case (element instanceof HTMLInputElement ||
			element instanceof HTMLTextAreaElement) &&
			element.value !== value:
			element.value = value;
			return;

		case element instanceof HTMLSelectElement && element.value !== value:
			element.value =
				[...element.options].findIndex(option => option.value === value) > -1
					? value
					: '';
			return;
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

	setAttribute(context.element, `${prefix}${kebabCase(name)}`, value);
	setElementValues(context.targets.getAll(`input:${name}`), value.stringified);

	const json = JSON.stringify(
		value.original,
		null,
		+(getComputedStyle(context.element)?.tabSize ?? '4'),
	);

	setElementContents(
		context.targets.getAll(`output:${name}`),
		value.stringified,
	);

	setElementContents(context.targets.getAll(`output:${name}:json`), json);
	setElementValues(context.targets.getAll(`input:${name}:json`), json);

	frames.set(
		context,
		requestAnimationFrame(() => {
			const json = JSON.stringify(
				context.data.value,
				null,
				+(getComputedStyle(context.element)?.tabSize ?? '4'),
			);

			setElementContents(context.targets.getAll('output::json'), json);
			setElementValues(context.targets.getAll('input::json'), json);
		}),
	);
}

export function setValueFromAttribute(
	context: Context,
	name: string,
	value: string,
): void {
	if (getString(context.data.value[name]) !== value) {
		context.data.value[name] = value == null ? value : parse(value) ?? value;
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

	const result =
		original == null
			? Reflect.deleteProperty(target, name)
			: Reflect.set(target, name, original);

	if (result) {
		cancelAnimationFrame(frames[name]);

		frames[name] = requestAnimationFrame(() => {
			setValue(context, prefix, name, {
				original,
				stringified,
			});
		});
	}

	return result;
}
