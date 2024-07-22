import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import type {Context} from '../controller/context';

export type Data = {
	value: PlainObject;
};

function setValue(
	context: Context,
	prefix: string,
	name: string,
	original: unknown,
	stringified: string,
): void {
	const {element} = context;

	if (isNullableOrWhitespace(original)) {
		element.removeAttribute(`${prefix}${name}`);
	} else {
		element.setAttribute(`${prefix}${name}`, stringified);
	}

	const inputs = context.targets.get(`input:${name}`);

	for (const input of inputs) {
		if (
			(input instanceof HTMLInputElement ||
				input instanceof HTMLTextAreaElement) &&
			input.value !== stringified
		) {
			input.value = stringified;
		}
	}

	const outputs = context.targets.get(`output:${name}`);

	for (const output of outputs) {
		output.textContent = stringified;
	}
}

export function createData(identifier: string, context: Context): Data {
	const frames: Record<string, number> = {};
	const prefix = `data-${identifier}-`;

	const instance = Object.create(null);

	Object.defineProperty(instance, 'value', {
		value: new Proxy(
			{},
			{
				set(target, property, value) {
					const previous = getString(Reflect.get(target, property));
					const next = getString(value);

					if (Object.is(previous, next)) {
						return true;
					}

					const result = Reflect.set(target, property, value);

					if (result) {
						const name = String(property);

						cancelAnimationFrame(frames[name]);

						frames[name] = requestAnimationFrame(() => {
							setValue(context, prefix, name, value, next);
						});
					}

					return result;
				},
			},
		),
	});

	return instance;
}
