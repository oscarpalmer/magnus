import {
	extendedActionAttributePattern,
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
	return type === 'action'
		? parseActionAttribute(value)
		: parseTargetAttribute(value);
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
