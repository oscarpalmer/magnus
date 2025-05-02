import {targetAttributePrefixPattern} from '../../constants';
import type {Context} from '../../controller/context';

export function handleTargetAttribute(
	context: Context,
	element: Element,
	name: string,
	_: string,
	added: boolean,
): void;

export function handleTargetAttribute(
	context: Context,
	element: Element,
	name: string,
	_: string,
	added: boolean,
	removePrefix: boolean,
): void;

export function handleTargetAttribute(
	context: Context,
	element: Element,
	name: string,
	_: string,
	added: boolean,
	unprefix?: boolean,
): void {
	const normalized =
		(unprefix ?? true) ? name.replace(targetAttributePrefixPattern, '') : name;

	if (added) {
		context.targets.add(normalized, element);
	} else {
		context.targets.remove(normalized, element);
	}
}
