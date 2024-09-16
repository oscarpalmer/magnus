import {
	actionAttributeNamePattern,
	actionAttributeValuePattern,
	controllerAttributePattern,
	inputOutputAttributePattern,
	targetAttributePattern,
} from '../constants';
import type {AttributeType, ParsedAttribute} from '../models';

export function getAttributeType(name: string): AttributeType | undefined {
	switch (true) {
		case actionAttributeNamePattern.test(name):
			return 'action';

		case controllerAttributePattern.test(name):
			return 'controller';

		case inputOutputAttributePattern.test(name):
			return 'input-output';

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
				actionAttributeValuePattern.exec(value) ??
				actionAttributeNamePattern.exec(name);
			break;

		case 'input-output':
			matches = inputOutputAttributePattern.exec(name);
			break;

		case 'target':
			matches = targetAttributePattern.exec(name);
			break;

		default:
			break;
	}

	if (matches != null) {
		return {
			identifier: matches[2],
			name: matches[1],
		};
	}
}
