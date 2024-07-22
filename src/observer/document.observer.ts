import {attribute} from '../controller/controller';
import {handleAttributeChanges, handleControllerAttribute} from './attributes';
import {handleActionAttribute} from './attributes/action.attribute';
import {
	handleInputAttribute,
	handleOutputAttribute,
	handleTargetAttribute,
} from './attributes/target.attribute';
import {createObserver, options, type Observer} from './observer';

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

	const callbacks = {
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
			handleAttributeChanges({
				added,
				callbacks,
				element,
				name,
				value,
			});
		},
	);
}
