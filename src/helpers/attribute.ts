import {
	extendedActionAttributePattern,
	outputAttributePattern,
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
			value: method,
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

		case 'output':
			return parseOutputAttribute(value);

		default:
			return parseTargetAttribute(value);
	}
}

function parseOutputAttribute(attribute: string): ParsedAttribute | undefined {
	const matches = outputAttributePattern.exec(attribute);

	if (matches != null) {
		const [, name, id, value, json] = matches;

		if (value == null && json == null) {
			return;
		}

		return {
			id,
			name,
			value: `${value ?? '$'}${json ?? ''}`,
		};
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
