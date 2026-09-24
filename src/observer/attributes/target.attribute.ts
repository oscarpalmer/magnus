import type {Context, ParsedAttribute} from '../../models';

// #region Functions

export function handleTargetAttribute(
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
	name: string,
): void;

export function handleTargetAttribute(
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
): void;

export function handleTargetAttribute(
	context: Context,
	element: Element,
	attribute: ParsedAttribute,
	added: boolean,
	name?: string,
): void {
	const normalized = name ?? attribute.matches[0][3];

	if (added) {
		context.targets.add(normalized, element);
	} else {
		context.targets.remove(normalized, element);
	}
}

// #endregion
