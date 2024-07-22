import {attribute} from '../controller/controller';
import {
	type AttributeChangeCallback,
	handleAttributeChanges,
	handleControllerAttribute,
} from './attributes';
import {handleActionAttribute} from './attributes/action.attribute';
import {
	handleInputAttribute,
	handleOutputAttribute,
	handleTargetAttribute,
} from './attributes/target.attribute';
import {type Observer, createObserver, options} from './observer';

export function observeDocument(): Observer {
	const actionAttribute = 'data-action';
	const inputAttribute = 'data-input';
	const outputAttribute = 'data-output';
	const targetAttribute = 'data-target';

	const attributes = [
		actionAttribute,
		attribute,
		inputAttribute,
		outputAttribute,
		targetAttribute,
	];

	const callbacks: Record<string, AttributeChangeCallback> = {
		[actionAttribute]: handleActionAttribute,
		[attribute]: handleControllerAttribute,
		[inputAttribute]: handleInputAttribute,
		[outputAttribute]: handleOutputAttribute,
		[targetAttribute]: handleTargetAttribute,
	};

	return createObserver(
		document.body,
		{
			...options,
			attributeFilter: attributes,
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
