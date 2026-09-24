import {EXPRESSION_ATTRIBUTES, EXPRESSION_ATTRIBUTES_LENGTH, TYPES_ATTRIBUTE} from '../constants';
import type {ParsedAttributeType, ParsedAttribute, ParsedAttributeData} from '../models';

// #region Types

type AttributeData = {
	data: ParsedAttributeData;
	matches: [string[], string[] | null | undefined];
	type: ParsedAttributeType;
};

// #endregion

// #region Functions

function getAttributeData(name: string): AttributeData | undefined {
	for (let index = 0; index < EXPRESSION_ATTRIBUTES_LENGTH; index += 1) {
		const matches = EXPRESSION_ATTRIBUTES[index].exec(name);

		if (matches == null) {
			continue;
		}

		const type = TYPES_ATTRIBUTE[index];

		return {
			type,
			data: {
				identifier: matches[2],
				name: matches[1],
			},
			matches: [matches, undefined],
		};
	}

	return undefined;
}

export function parseAttribute(name: string, value: string | null): ParsedAttribute | undefined {
	const data = getAttributeData(name);

	return data == null
		? undefined
		: {
				...data,
				original: {name, value},
			};
}

// #endregion
