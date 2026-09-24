import {
	EXPRESSION_ACTION_ATTRIBUTE_VALUE,
	EXPRESSION_WHITESPACE,
	TYPE_ACTION,
	TYPE_CONTROLLER,
} from '../../constants';
import type {ParsedAttribute} from '../../models';
import {handleContextualAttribute, handleControllerAttribute} from './index';

// #region Functions

function createActionAttribute(
	name: string,
	value: string,
	nameMatches: string[],
	valueMatches: string[] | null,
): ParsedAttribute {
	const matches = valueMatches ?? nameMatches;

	return {
		data: {
			identifier: matches[2],
			name: matches[1],
		},
		matches: [nameMatches, valueMatches],
		original: {
			name,
			value,
		},
		type: TYPE_ACTION,
	};
}

function getAttribute(element: Element, name: string): string | undefined {
	return attributes.get(element)?.get(name);
}

function getChanges(from: string[], to: string[]): string[][] {
	const attributes: string[][] = [[], []];

	for (let outer = 0; outer < 2; outer += 1) {
		const values = outer === 0 ? from : to;
		const other = outer === 0 ? to : from;

		const {length} = values;

		for (let inner = 0; inner < length; inner += 1) {
			const value = values[inner];

			if (!other.includes(value)) {
				attributes[outer].push(value);
			}
		}
	}

	return attributes;
}

function getParts(value: string): string[] {
	return value
		.split(EXPRESSION_WHITESPACE)
		.map(part => part.trim())
		.filter(part => part.length > 0);
}

function getTokens(value: string | null | undefined, nameMatches: string[]): string[] {
	if (value == null) {
		return [];
	}

	const parts = getParts(value);

	// An empty value is a name-only action (`on:controller.action`), represented by an empty token
	if (parts.length === 0 && nameMatches[1] != null) {
		parts.push('');
	}

	return parts;
}

function handleActionAttributes(
	element: Element,
	attribute: ParsedAttribute,
	removed: boolean,
): void {
	const {name} = attribute.original;
	const [nameMatches] = attribute.matches;

	const next = removed ? null : attribute.original.value;

	const changes = getChanges(
		getTokens(getAttribute(element, name), nameMatches),
		getTokens(next, nameMatches),
	);

	for (let changesIndex = 0; changesIndex < 2; changesIndex += 1) {
		const changed = changes[changesIndex];
		const changedLength = changed.length;
		const added = changesIndex === 1;

		for (let changedIndex = 0; changedIndex < changedLength; changedIndex += 1) {
			const token = changed[changedIndex];

			const valueMatches =
				token.length === 0 ? null : EXPRESSION_ACTION_ATTRIBUTE_VALUE.exec(token);

			if (token.length === 0 || valueMatches != null) {
				handleContextualAttribute(
					element,
					createActionAttribute(name, token, nameMatches, valueMatches),
					added,
				);
			}
		}
	}

	updateAttributes(element, name, next);
}

export function handleAttributeChanges(
	element: Element,
	attribute: ParsedAttribute,
	removed: boolean,
): void {
	if (attribute.type === TYPE_ACTION) {
		handleActionAttributes(element, attribute, removed);

		return;
	}

	const added = !removed && attribute.original.value != null;

	if (attribute.type === TYPE_CONTROLLER) {
		handleControllerAttribute(element, attribute.original.name, added);
	} else {
		handleContextualAttribute(element, attribute, added);
	}
}

function updateAttributes(element: Element, name: string, value: string | null): void {
	let elementAttributes = attributes.get(element);

	if (value == null) {
		elementAttributes?.delete(name);

		return;
	}

	if (elementAttributes == null) {
		elementAttributes = new Map();

		attributes.set(element, elementAttributes);
	}

	elementAttributes.set(name, value);
}

// #endregion

// #region Variables

const attributes = new WeakMap<Element, Map<string, string>>();

// #endregion
