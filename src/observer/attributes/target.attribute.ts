import {attributeCallbacks} from '../../constants';
import type {Context} from '../../controller/context';
import {parseAttribute} from '../../helpers/attribute';
import type {AttributeType} from '../../models';
import {findContext} from '../../store/controller.store';

export function handleTargetAttribute(
	type: AttributeType,
	element: Element,
	value: string,
	added: boolean,
): void {
	const callback = attributeCallbacks[type];
	const parsed = parseAttribute(type, value);

	let count = 0;

	function step() {
		if (parsed == null || count >= 10) {
			return;
		}

		const context = findContext(element, parsed.name, parsed.id);

		if (context == null) {
			count += 1;

			requestAnimationFrame(step);
		} else {
			callback?.(
				context,
				element,
				type === 'action' ? value : parsed.value,
				added,
			);
		}
	}

	step();
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
