import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getString, parse} from '@oscarpalmer/atoms/string';
import type {Context} from '../controller/context';

export class Data {
	readonly value: PlainObject;

	constructor(context: Context) {
		const frames: Record<string, number> = {};
		const prefix = `data-${context.name}-`;

		this.value = new Proxy(
			{},
			{
				set(target, property, next) {
					const previous = Reflect.get(target, property);
					const nextAsString = getString(next);

					if (Object.is(getString(previous), nextAsString)) {
						return true;
					}

					const result = Reflect.set(target, property, next);

					if (result) {
						const name = String(property);

						cancelAnimationFrame(frames[name]);

						frames[name] = requestAnimationFrame(() => {
							setValue(
								context,
								prefix,
								name,
								next,
								next == null ? '' : nextAsString,
							);
						});
					}

					return result;
				},
			},
		);
	}
}

function setAttribute(
	element: Element,
	name: string,
	original: unknown,
	stringified: string,
): void {
	if (isNullableOrWhitespace(original)) {
		element.removeAttribute(name);
	} else {
		element.setAttribute(name, stringified);
	}
}

function setElementContents(
	elements: Element[],
	_: unknown,
	value: string,
): void {
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		elements[index].textContent = value;
	}
}

function setElementValues(elements: Element[], value: string): void {
	const {length} = elements;

	for (let index = 0; index < length; index += 1) {
		const element = elements[index];

		if (
			(element instanceof HTMLInputElement ||
				element instanceof HTMLTextAreaElement) &&
			element.value !== value
		) {
			element.value = value;
		} else if (
			element instanceof HTMLSelectElement &&
			element.value !== value
		) {
			if (
				Array.from(element.options).findIndex(
					option => option.value === value,
				) > -1
			) {
				element.value = value;
			}
		}
	}
}

function setValue(
	context: Context,
	prefix: string,
	name: string,
	original: unknown,
	stringified: string,
): void {
	setAttribute(context.element, `${prefix}${name}`, original, stringified);

	setElementContents(
		context.targets.get(`output:${name}`),
		original,
		stringified,
	);

	setElementValues(context.targets.get(`input:${name}`), stringified);
}

export function setValueFromAttribute(
	context: Context,
	name: string,
	value: string,
): void {
	const parsed = value == null ? null : parse(value) ?? value;

	if (!Object.is(getString(context.data.value[name]), value)) {
		context.data.value[name] = parsed;
	}
}
