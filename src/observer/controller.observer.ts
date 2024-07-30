import {createObserver, type Observer} from './index';
import {findContext} from '../store/controller.store';
import type {Context} from '../controller/context';

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
