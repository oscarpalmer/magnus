import {
	actionAttributeNamePattern,
	actionAttributeValuePattern,
	controllerAttributePattern,
	dataAttributePattern,
	inputOutputAttributePattern,
	targetAttributePattern,
} from '../constants';
import type {AttributeType, ParsedAttribute} from '../models';

export function getAttributeType(name: string): AttributeType | undefined {
	switch (true) {
		case name === '_' || actionAttributeNamePattern.test(name):
			return 'action';

		case controllerAttributePattern.test(name) ||
			dataAttributePattern.test(name):
			return 'controller';

		case inputOutputAttributePattern.test(name):
			return 'io';

		case targetAttributePattern.test(name):
			return 'target';

		default:
			break;
	}
}

export function parseAttribute(
	type: AttributeType,
	name: string,
	value: string,
): ParsedAttribute | undefined {
	let matches: RegExpExecArray | null = null;

	switch (type) {
		case 'action':
			matches =
				value.length > 0
					? actionAttributeValuePattern.exec(value)
					: actionAttributeNamePattern.exec(name);
			break;

		case 'io':
			matches = inputOutputAttributePattern.exec(name);
			break;

		case 'target':
			matches = targetAttributePattern.exec(name);
			break;
	}

	if (matches != null) {
		return {
			identifier: matches[2],
			name: matches[1],
		};
	}
}
