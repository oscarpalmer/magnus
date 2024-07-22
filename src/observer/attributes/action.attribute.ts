import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Context} from '../../controller/context';
import {getEventParameters} from '../../helpers/event';
import {attributeActionPattern} from './index';
import {handleTarget} from './target.attribute';

export function handleAction(
	context: Context,
	element: Element,
	_: string,
	value: string,
	added: boolean,
	handler?: (event: Event) => void,
): void {
	if (context.actions.has(value)) {
		if (added) {
			context.actions.add(value, element);
		} else {
			context.actions.remove(value, element);
		}

		return;
	}

	if (!added) {
		return;
	}

	const parameters = getEventParameters(element, value);

	if (parameters == null) {
		return;
	}

	const callback =
		handler ??
		((context.controller as unknown as PlainObject)[parameters.callback] as (
			event: Event,
		) => void);

	if (typeof callback === 'function') {
		context.actions.create({
			callback: callback.bind(context.controller),
			name: value,
			options: parameters.options,
			target: element,
			type: parameters.type,
		});

		context.actions.add(value, element);
	}
}

export function handleActionAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTarget(element, value, added, attributeActionPattern, handleAction);
}
