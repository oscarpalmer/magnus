import {
	EXPRESSIONS,
	EXPRESSION_ACTION_ATTRIBUTE_NAME,
	EXPRESSION_ACTION_ATTRIBUTE_VALUE,
	EXPRESSION_IO_ATTRIBUTE,
	EXPRESSION_TARGET_ATTRIBUTE_FULL,
	TYPE_ACTION,
	TYPE_INPUT,
	TYPE_OUTPUT,
	TYPES_ATTRIBUTE,
} from '../constants';
import type {Attribute, AttributeParsed, AttributeType} from '../models';

// #region Functions

export function getAttributeType(name: string): AttributeType | undefined {
	for (let index = 0; index < 6; index += 1) {
		if (EXPRESSIONS[index].test(name)) {
			return TYPES_ATTRIBUTE[index];
		}
	}

	return undefined;
}

export function parseAttribute(attribute: Attribute): AttributeParsed {
	let offset = 0;

	let matches: RegExpExecArray;

	switch (attribute.type) {
		case TYPE_ACTION:
			matches = (
				attribute.value.length > 0
					? EXPRESSION_ACTION_ATTRIBUTE_VALUE.exec(attribute.value)
					: EXPRESSION_ACTION_ATTRIBUTE_NAME.exec(attribute.name)
			) as RegExpExecArray;
			break;

		case TYPE_INPUT:
		case TYPE_OUTPUT:
			matches = EXPRESSION_IO_ATTRIBUTE.exec(attribute.name) as RegExpExecArray;
			offset = 1;
			break;

		default:
			matches = EXPRESSION_TARGET_ATTRIBUTE_FULL.exec(attribute.name) as RegExpExecArray;
			break;
	}

	return {
		identifier: matches[2 + offset],
		name: matches[1 + offset],
	};
}

// #endregion
