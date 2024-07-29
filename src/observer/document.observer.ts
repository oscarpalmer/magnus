import {createObserver} from './index';
import type {AttributeChangeCallback, Observer} from '../models';
import {handleAttributeChanges, handleControllerAttribute} from './attributes';
import {handleActionAttribute} from './attributes/action.attribute';
import {
	handleInputAttribute,
	handleOutputAttribute,
} from './attributes/input-output.attribute';
import {handleTargetAttribute} from './attributes/target.attribute';

const callbacks: Record<string, AttributeChangeCallback> = {
	'data-action': handleActionAttribute,
	'data-controller': handleControllerAttribute,
	'data-input': handleInputAttribute,
	'data-output': handleOutputAttribute,
	'data-target': handleTargetAttribute,
};

const attributes = Object.keys(callbacks);

export function observerDocument(): Observer {
	return createObserver(
		document.body,
		{
			attributeFilter: attributes,
			attributes: true,
			childList: true,
			subtree: true,
		},
		(element, name, value, added) => {
			handleAttributeChanges(
				{
					added,
					element,
					name,
					value,
					callback: callbacks[name],
				},
				false,
			);
		},
	);
}
