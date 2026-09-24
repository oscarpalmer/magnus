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

function getAttributeData(name: string, value: string | null): AttributeData | undefined {
	for (let index = 0; index < EXPRESSION_ATTRIBUTES_LENGTH; index += 1) {
		const [firstExpression, secondExpression] = EXPRESSION_ATTRIBUTES[index];

		const firstMatches = firstExpression.exec(name);

		if (firstMatches == null) {
			continue;
		}

		const secondMatches =
			value == null || value.length === 0 ? undefined : secondExpression?.exec(value);

		const matches = secondMatches ?? firstMatches;
		const type = TYPES_ATTRIBUTE[index];

		return {
			type,
			data: {
				identifier: matches[2],
				name: matches[1],
			},
			matches: [firstMatches, secondMatches],
		};
	}

	return undefined;
}

export function parseAttribute(name: string, value: string | null): ParsedAttribute | undefined {
	const data = getAttributeData(name, value);

	return data == null
		? undefined
		: {
				...data,
				original: {name, value},
			};
}

// #endregion
