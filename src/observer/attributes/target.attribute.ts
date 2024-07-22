import type {Context} from '../../controller/context';
import {parseAttribute} from '../../helpers/attribute';
import {controllers} from '../../store/controller.store';
import {handleAction} from './action.attribute';
import type {AttributeHandleCallback} from './index';

export function handleInputAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTarget('target', element, value, added, handleInput);
}

export function handleOutputAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTarget('target', element, value, added, handleOutput);
}

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

		let identified: Element | null;

		if (parsed.identifier == null) {
			identified = element.closest(`[data-controller*="${parsed.controller}"]`);
		} else {
			identified = document.querySelector(`#${parsed.identifier}`);
		}

		if (identified == null) {
			return;
		}

		const context = controllers
			.get(parsed.controller)
			?.instances.get(identified);

		if (context != null) {
			callback(
				context,
				element,
				'',
				type === 'action' ? value : parsed.name,
				added,
			);
		}
	}

export function handleTargetAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTarget('target', element, value, added, handleTargetElement);
}

function handleInput(
	context: Context,
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	const isInput = element instanceof HTMLInputElement;
	const isSelect = element instanceof HTMLSelectElement;

	if (
		context != null &&
		(isInput || isSelect || element instanceof HTMLTextAreaElement)
	) {
		const isCheckbox = isInput && element.getAttribute('type') === 'checkbox';

		handleAction(
			context,
			element,
			'',
			isSelect ? 'change' : 'input',
			added,
			(event: Event) => {
				context.data.value[value] = isCheckbox
					? (event.target as HTMLInputElement).checked
					: (event.target as HTMLInputElement).value;
			},
		);

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
