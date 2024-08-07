import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
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
		const prefix = `data-${context.name}-`;

		this.value = new Proxy(
			{},
			{
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

					const result = Reflect.set(target, name, next);

					if (result) {
						cancelAnimationFrame(frames[name]);

						frames[name] = requestAnimationFrame(() => {
							setValue(context, prefix, name, {
								original: next,
								stringified: next == null ? '' : nextAsString,
							});
						});
					}

					return result;
				},
			},
		);
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
		elements[index].textContent = value;
	}
}

function setElementValue(element: Element, value: string): void {
	switch (true) {
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

	setElementContents(
		context.targets.getAll(`output:${name}`),
		value.stringified,
	);

	setElementContents(
		context.targets.getAll(`output:${name}:json`),
		JSON.stringify(
			value.original,
			null,
			+(getComputedStyle(context.element)?.tabSize ?? '4'),
		),
	);

	frames.set(
		context,
		requestAnimationFrame(() => {
			const all = JSON.stringify(context.data.value, null, 2);

			setElementContents(context.targets.getAll('output:$:json'), all);
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
