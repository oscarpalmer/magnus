import {
	EXPRESSION_ACTION_ATTRIBUTE_NAME,
	EXPRESSION_ACTION_ATTRIBUTE_VALUE,
	EXPRESSION_CONTROLLER_ATTRIBUTE_FULL,
	EXPRESSION_DATA_ATTRIBUTE,
	EXPRESSION_IO_ATTRIBUTE_FULL,
	EXPRESSION_TARGET_ATTRIBUTE_FULL,
	TYPE_ACTION,
	TYPE_CONTROLLER,
	TYPE_DATA,
	TYPE_IO,
	TYPE_TARGET,
} from '../constants';
import type {AttributeType, ParsedAttribute} from '../models';

export function getAttributeType(name: string): AttributeType | undefined {
	for (let index = 0; index < 5; index += 1) {
		if (expressions[index].test(name)) {
			return types[index];
		}
	}
}

export function parseAttribute(
	type: AttributeType,
	name: string,
	value: string,
): ParsedAttribute | undefined {
	let matches: RegExpExecArray;

	switch (type) {
		case TYPE_ACTION:
			matches = (
				value.length > 0
					? EXPRESSION_ACTION_ATTRIBUTE_VALUE.exec(value)
					: EXPRESSION_ACTION_ATTRIBUTE_NAME.exec(name)
			) as RegExpExecArray;
			break;

		case TYPE_IO:
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

//

const expressions = [
	EXPRESSION_ACTION_ATTRIBUTE_NAME,
	EXPRESSION_CONTROLLER_ATTRIBUTE_FULL,
	EXPRESSION_DATA_ATTRIBUTE,
	EXPRESSION_IO_ATTRIBUTE_FULL,
	EXPRESSION_TARGET_ATTRIBUTE_FULL,
];

const types: AttributeType[] = [TYPE_ACTION, TYPE_CONTROLLER, TYPE_DATA, TYPE_IO, TYPE_TARGET];
