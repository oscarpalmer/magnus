import {camelCase} from '@oscarpalmer/atoms/string';
import {
	extendedActionAttributePattern,
	inputAndOutputAttributePattern,
	targetAttributePattern,
} from '../constants';
import type {AttributeType, ParsedAttribute} from '../models';

function parseActionAttribute(attribute: string): ParsedAttribute | undefined {
	const matches = extendedActionAttributePattern.exec(attribute);

	if (matches != null) {
		const [, , , , name, id, method] = matches;

		return {
			id: name == null ? undefined : id,
			name: name == null ? id : name,
			value: camelCase(method),
		};
	}
}

export function parseAttribute(
	type: AttributeType,
	value: string,
): ParsedAttribute | undefined {
	switch (type) {
		case 'action':
			return parseActionAttribute(value);

		case 'input':
		case 'output':
			return parseInputAndOutputAttribute(value);

		default:
			return parseTargetAttribute(value);
	}
}

function parseInputAndOutputAttribute(
	attribute: string,
): ParsedAttribute | undefined {
	const matches = inputAndOutputAttributePattern.exec(attribute);

	if (matches != null) {
		const [, name, id, value, json] = matches;

		if (!(value == null && json == null)) {
			return {
				id,
				name,
				value: `${value ?? '$'}${json ?? ''}`,
			};
		}
	}
}

function parseTargetAttribute(attribute: string): ParsedAttribute | undefined {
	const matches = targetAttributePattern.exec(attribute);

	if (matches != null) {
		const [, name, id, value] = matches;

		return {
			id,
			name,
			value,
		};
	}
}
