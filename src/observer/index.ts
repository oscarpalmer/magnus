import {type CancellableCallback, debounce, type noop} from '@oscarpalmer/atoms/function';
import {DEBOUNCE_DELAY} from '../constants';
import {getAttributeType} from '../helpers/attribute.helper';
import {contexts} from '../store/context.store';
import {handleDataAttribute} from './attributes';
import {handleAttributeChanges} from './attributes/changes.attribute';

export class Observer {
	private readonly observer: MutationObserver;

	constructor() {
		this.observer = new MutationObserver(entries => {
			const {length} = entries;

			for (let index = 0; index < length; index += 1) {
				const entry = entries[index];

				if (entry.type === 'attributes') {
					handleAttribute(
						entry.target as Element,
						entry.attributeName as string,
						entry.oldValue,
						false,
					);
				} else {
					handleNodes(entry.addedNodes, false);
					handleNodes(entry.removedNodes, true);
				}
			}
		});

		this.start();
	}

	start(): void {
		this.observer.observe(document.body, options);

		this.update();
	}

	stop(): void {
		debouncer.cancel();

		this.observer.disconnect();
	}

	update(): void {
		debouncer();
	}
}

function createObserver(): Observer {
	return new Observer();
}

function handleAttribute(
	element: Element,
	name: string,
	value: string | null,
	removed: boolean,
): void {
	const type = getAttributeType(name);

	if (type === 'data') {
		handleDataAttribute(element, name);
	} else if (type != null) {
		handleAttributeChanges(type, element, name, value!, removed);
	}
}

function handleElement(element: Element, removed: boolean): void {
	const names = element
		.getAttributeNames()
		.filter((name, index, array) => array.indexOf(name) === index);

	const {length} = names;

	for (let index = 0; index < length; index += 1) {
		handleAttribute(element, names[index], '', removed);
	}

	if (removed) {
		contexts.disconnect(element);
	}
}

function handleNodes(nodes: NodeList | Node[], removed: boolean): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Element) {
			handleElement(node, removed);
			handleNodes(node.childNodes, removed);
		}
	}
}

const debouncer: CancellableCallback<typeof noop> = debounce(() => {
	handleNodes([document.body], false);
}, DEBOUNCE_DELAY);

const options: MutationObserverInit = {
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
};

const observer: Observer = createObserver();

export default observer;
