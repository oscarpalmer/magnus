import {EXPRESSION_TARGET_ATTRIBUTE_PREFIX} from '../../constants';
import type {AttributeHandleCallbackParameters} from '../../models';

export function handleTargetAttribute(parameters: AttributeHandleCallbackParameters): void;

export function handleTargetAttribute(
	parameters: AttributeHandleCallbackParameters,
	removePrefix: boolean,
): void;

export function handleTargetAttribute(
	parameters: AttributeHandleCallbackParameters,
	unprefix?: boolean,
): void {
	const {added, context, element, name} = parameters;

	const normalized =
		(unprefix ?? true) ? name.replace(EXPRESSION_TARGET_ATTRIBUTE_PREFIX, '') : name;

	if (added) {
		context.targets.add(normalized, element);
	} else {
		context.targets.remove(normalized, element);
	}
}
