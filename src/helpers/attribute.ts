import {
	EXPRESSION_ACTION_ATTRIBUTE_NAME,
	EXPRESSION_ACTION_ATTRIBUTE_VALUE,
	EXPRESSION_CONTROLLER_ATTRIBUTE_FULL,
	EXPRESSION_DATA_ATTRIBUTE,
	EXPRESSION_IO_ATTRIBUTE_FULL,
	EXPRESSION_TARGET_ATTRIBUTE_FULL,
} from '../constants';
import type {AttributeType, ParsedAttribute} from '../models';

export function getAttributeType(name: string): AttributeType | undefined {
	switch (true) {
		case EXPRESSION_ACTION_ATTRIBUTE_NAME.test(name):
			return 'action';

		case EXPRESSION_CONTROLLER_ATTRIBUTE_FULL.test(name):
			return 'controller';

		case EXPRESSION_DATA_ATTRIBUTE.test(name):
			return 'data';

		case EXPRESSION_IO_ATTRIBUTE_FULL.test(name):
			return 'io';

		case EXPRESSION_TARGET_ATTRIBUTE_FULL.test(name):
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
					? EXPRESSION_ACTION_ATTRIBUTE_VALUE.exec(value)
					: EXPRESSION_ACTION_ATTRIBUTE_NAME.exec(name)
			) as RegExpExecArray;
			break;

		case 'io':
			matches = EXPRESSION_IO_ATTRIBUTE_FULL.exec(name) as RegExpExecArray;
			break;

		default:
			matches = EXPRESSION_TARGET_ATTRIBUTE_FULL.exec(name) as RegExpExecArray;
			break;
	}

	return {
		identifier: matches[2],
		name: matches[1],
	};
}
