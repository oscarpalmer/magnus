import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Context} from '../../controller/context';
import {findTarget} from '../../helpers/element';
import {getEventParameters} from '../../helpers/event';
import {handleTarget} from './target.attribute';

export function handleAction(
		context: Context,
		element: Element,
		name: string,
		value: string,
		added: boolean,
		handler?: (event: Event) => void,
	): void {
		const action = handler == null ? value : name;

		if (context.actions.has(action)) {
			if (added) {
				context.actions.add(action, element);
			} else {
				context.actions.remove(action, element);
			}

			return;
		}

		if (!added) {
			return;
		}

		const parameters =
			handler == null
				? getEventParameters(element, value, context.element === element)
				: {
						callback: '',
						options: {
							capture: false,
							once: false,
							passive: true,
						},
						type: value,
					};

		if (parameters == null) {
			return;
		}

		const callback =
			handler ??
			((context.controller as unknown as PlainObject)[parameters.callback] as (
				event: Event,
			) => void);

		if (typeof callback !== 'function') {
			return;
		}

		const target =
			parameters.external == null
				? element
				: findTarget(
						element,
						parameters.external.controller,
						parameters.external.identifier,
					);

		if (target != null) {
			context.actions.create({
				callback: callback.bind(context.controller),
				name: action,
				options: parameters.options,
				type: parameters.type,
			});

			context.actions.add(action, target);
		}
	}

export function handleActionAttribute(
	element: Element,
	_: string,
	value: string,
	added: boolean,
): void {
	handleTarget('action', element, value, added, handleAction);
}
