import {EXPRESSION_TARGET_ATTRIBUTE_PREFIX} from '../../constants';
import type {AttributeHandlerCallbackParameters} from '../../models';

export function handleTargetAttribute(parameters: AttributeHandlerCallbackParameters): void;

export function handleTargetAttribute(
	parameters: AttributeHandlerCallbackParameters,
	removePrefix: boolean,
): void;

export function handleTargetAttribute(
	parameters: AttributeHandlerCallbackParameters,
	unprefix?: boolean,
): void {
	const {context, element, name} = parameters;

	const normalized =
		(unprefix ?? true) ? name.replace(EXPRESSION_TARGET_ATTRIBUTE_PREFIX, '') : name;

	if (parameters.added) {
		context.targets.add(normalized, element);
	} else {
		context.targets.remove(normalized, element);
	}
}
