import {
	ATTRIBUTES,
	EXPRESSION_ACTION_ATTRIBUTE_NAME,
	EXPRESSION_ACTION_ATTRIBUTE_VALUE,
	EXPRESSION_IO_ATTRIBUTE_FULL,
	EXPRESSION_TARGET_ATTRIBUTE_FULL,
	TYPE_ACTION,
	TYPE_IO,
	TYPES_ATTRIBUTE,
} from '../constants';
import type {Attribute, AttributeParsed, AttributeType} from '../models';

// #region Functions

export function getAttributeType(name: string): AttributeType | undefined {
	for (let index = 0; index < 5; index += 1) {
		if (ATTRIBUTES[index].test(name)) {
			return TYPES_ATTRIBUTE[index];
		}
	}

	return undefined;
}

export function parseAttribute(attribute: Attribute): AttributeParsed | undefined {
	let matches: RegExpExecArray;

	switch (attribute.type) {
		case TYPE_ACTION:
			matches = (
				attribute.value.length > 0
					? EXPRESSION_ACTION_ATTRIBUTE_VALUE.exec(attribute.value)
					: EXPRESSION_ACTION_ATTRIBUTE_NAME.exec(attribute.name)
			) as RegExpExecArray;
			break;

		case TYPE_IO:
			matches = EXPRESSION_IO_ATTRIBUTE_FULL.exec(attribute.name) as RegExpExecArray;
			break;

		default:
			matches = EXPRESSION_TARGET_ATTRIBUTE_FULL.exec(attribute.name) as RegExpExecArray;
			break;
	}

	return {
		identifier: matches[2],
		name: matches[1],
	};
}

// #endregion
