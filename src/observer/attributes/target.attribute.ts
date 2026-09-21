import {EXPRESSION_TARGET_ATTRIBUTE_PREFIX} from '../../constants';
import type {Attribute, Context} from '../../models';

// #region Functions

export function handleTargetAttribute(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
	name: string,
): void;

export function handleTargetAttribute(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
): void;

export function handleTargetAttribute(
	context: Context,
	element: Element,
	attribute: Attribute,
	added: boolean,
	name?: string,
): void {
	const normalized = name ?? attribute.name.replace(EXPRESSION_TARGET_ATTRIBUTE_PREFIX, '');

	if (added) {
		context.targets.add(normalized, element);
	} else {
		context.targets.remove(normalized, element);
	}
}

// #endregion
