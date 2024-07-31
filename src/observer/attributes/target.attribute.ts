import type {Context} from '../../controller/context';
import {parseAttribute} from '../../helpers/attribute';
import type {AttributeHandleCallback} from '../../models';
import {findContext} from '../../store/controller.store';

export function handleTarget(
	type: 'action' | 'input' | 'output' | 'target',
	element: Element,
	value: string,
	added: boolean,
	callback: AttributeHandleCallback,
): void {
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
			callback(
				context,
				element,
				type === 'action' ? value : parsed.value,
				added,
			);
		}
	}

	step();
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
