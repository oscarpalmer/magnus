import type {Context} from '../controller/context';
import {handleDataAttribute} from './attributes/data.attribute';
import {type Observer, createObserver, options} from './observer';

export function observeController(context: Context): Observer {
	const prefix = `data-${context.identifier}-`;
	const {length} = prefix;

	return createObserver(
		context.element,
		{
			...options,
		},
		(element, name) => {
			if (name.startsWith(prefix)) {
				handleDataAttribute(
					context,
					name.slice(length),
					element.getAttribute(name) ?? '',
				);
			}
		},
	);
}
