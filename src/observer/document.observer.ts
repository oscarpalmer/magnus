import {attributeTypes, controllerAttribute} from '../constants';
import type {AttributeType} from '../models';
import {handleControllerAttribute} from './attributes';
import {handleAttributeChanges} from './attributes/changes.attribute';
import {type Observer, createObserver} from './index';

export function observerDocument(): Observer {
	const attributes = [
		controllerAttribute,
		...attributeTypes.map(type => `data-${type}`),
	];

	return createObserver(
		document.body,
		{
			attributeFilter: attributes,
			attributeOldValue: true,
			attributes: true,
			childList: true,
			subtree: true,
		},
		(element, name, value) => {
			if (attributes.includes(name)) {
				handleAttributeChanges(
					name.slice(5) as AttributeType,
					{
						element,
						value,
						handler:
							name === controllerAttribute
								? handleControllerAttribute
								: undefined,
					},
					false,
				);
			}
		},
	);
}
