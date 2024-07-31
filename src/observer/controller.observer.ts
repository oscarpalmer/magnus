import type {Context} from '../controller/context';
import {findContext} from '../store/controller.store';
import {setValueFromAttribute} from '../store/data.store';
import {type Observer, createObserver} from './index';

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

				if (context != null) {
					setValueFromAttribute(
						context,
						attribute.slice(prefix.length),
						element.getAttribute(attribute) ?? '',
					);
				}
			}
		},
	);
}
