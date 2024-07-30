import type {Context} from '../../controller/context';
import {parseAttribute} from '../../helpers/attribute';
import type {AttributeHandleCallback} from '../../models';
import {findContext} from '../../store/controller.store';

export function handleTarget(
	type: 'action' | 'target',
	element: Element,
	value: string,
	added: boolean,
	callback: AttributeHandleCallback,
): void {
	const parsed = parseAttribute(type, value);

	if (parsed == null) {
		return;
	}

	const context = findContext(element, parsed.name, parsed.id);

	if (context != null) {
		callback(context, element, type === 'action' ? value : parsed.value, added);
	}
}

export function handleTargetAttribute(
	element: Element,
	value: string,
	added: boolean,
): void {
	handleTarget('target', element, value, added, handleTargetElement);
}

export function handleTargetElement(
	context: Context,
	element: Element,
	value: string,
	added: boolean,
): void {
	if (added) {
		context.targets.add(value, element);
	} else {
		context.targets.remove(value, element);
	}
}
