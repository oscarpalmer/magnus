import type {Context} from '../../controller/context';
import {controllers} from '../../store/controller.store';
import {handleAction} from './action.attribute';
import {type AttributeHandleCallback, attributeTargetPattern} from './index';

export function handleInputAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTarget(element, value, added, attributeTargetPattern, handleInput);
}

export function handleOutputAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTarget(element, value, added, attributeTargetPattern, handleOutput);
}

export function handleTarget(
	element: Element,
	value: string,
	added: boolean,
	pattern: RegExp,
	callback: AttributeHandleCallback,
): void {
	const [, identifier, controller, name] = pattern.exec(value) ?? [];

	if (controller == null || name == null) {
		return;
	}

	let identified: Element | null;

	if (identifier == null) {
		identified = element.closest(`[data-controller*="${controller}"]`);
	} else {
		identified = document.querySelector(`#${identifier}`);
	}

	if (identified == null) {
		return;
	}

	const context = controllers.get(controller)?.instances.get(identified);

	if (context != null) {
		callback(context, element, '', name, added);
	}
}

export function handleTargetAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTarget(
		element,
		value,
		added,
		attributeTargetPattern,
		handleTargetElement,
	);
}

function handleInput(
	context: Context,
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	if (
		context != null &&
		(element instanceof HTMLInputElement ||
			element instanceof HTMLTextAreaElement)
	) {
		const checkbox = element.getAttribute('type') === 'checkbox';

		handleAction(context, element, '', 'input', added, (event: Event) => {
			context.data.value[value] = checkbox
				? (event.target as HTMLInputElement).checked
				: (event.target as HTMLInputElement).value;
		});

		handleTargetElement(context, element, '', `input:${value}`, added);
	}
}

function handleOutput(
	context: Context,
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTargetElement(context, element, '', `output:${value}`, added);
}

function handleTargetElement(
	context: Context,
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	if (added) {
		context.targets.add(value, element);
	} else {
		context.targets.remove(value, element);
	}
}
