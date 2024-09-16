import {getAttributeType} from '../helpers/attribute';
import {handleAttributeChanges} from './attributes/changes.attribute';
import {type Observer, createObserver} from './index';

export function observeDocument(): Observer {
	return createObserver(
		document.body,
		{
			attributeOldValue: true,
			attributes: true,
			childList: true,
			subtree: true,
		},
		(element, name, value) => {
			const type = getAttributeType(name);

			if (type != null) {
				handleAttributeChanges(type, element, name, value, false);
			}
		},
	);
}
