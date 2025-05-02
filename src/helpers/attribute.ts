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
		case actionAttributeNamePattern.test(name):
			return 'action';

		case controllerAttributePattern.test(name):
			return 'controller';

		case dataAttributePattern.test(name):
			return 'data';

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
	let matches: RegExpExecArray;

	switch (type) {
		case 'action':
			matches = (
				value.length > 0
					? actionAttributeValuePattern.exec(value)
					: actionAttributeNamePattern.exec(name)
			) as RegExpExecArray;
			break;

		case 'io':
			matches = inputOutputAttributePattern.exec(name) as RegExpExecArray;
			break;

		default:
			matches = targetAttributePattern.exec(name) as RegExpExecArray;
			break;
	}

	return {
		identifier: matches[2],
		name: matches[1],
	};
}
