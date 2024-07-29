import {createObserver} from './index';
import type {Context, Observer} from '../models';
import {findContext} from '../store/controller.store';

export function observeController(name: string, element: Element): Observer {
	const prefix = `data-${name}-`;

	let context: Context | undefined;

	return createObserver(
		element,
		{
			attributes: true,
		},
		(element, attribute) => {
			if (attribute.startsWith(prefix)) {
				context ??= findContext(element, name);

				const property = attribute.slice(prefix.length);

				if (context != null) {
					const previous = context.data.value[property];
					const next = element.getAttribute(attribute) ?? '';

					if (!Object.is(previous, next)) {
						context.data.value[property] = next;
					}
				}
			}
		},
	);
}
