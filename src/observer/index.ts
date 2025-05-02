import {debounce} from '@oscarpalmer/atoms/function';
import {getAttributeType} from '../helpers/attribute';
import {handleAttributeChanges} from './attributes/changes.attribute';
import {handleDataAttribute} from './attributes';

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
					);
				} else {
					handleNodes(entry.addedNodes);
					handleNodes(entry.removedNodes);
				}
			}
		});

		this.start();
	}

	start() {
		if (!active) {
			active = true;

			this.observer.observe(document.body, options);

			this.update();
		}
	}

	stop() {
		if (active) {
			active = false;

			debouncer.cancel();

			this.observer.disconnect();
		}
	}

	update() {
		if (active) {
			debouncer();
		}
	}
}

function createObserver(): Observer {
	return new Observer();
}

function handleAttribute(
	element: Element,
	name: string,
	value: string | null,
): void {
	const type = getAttributeType(name);

	if (type === 'data') {
		handleDataAttribute(element, name);
	} else if (type != null) {
		handleAttributeChanges(type, element, name, value);
	}
}

function handleElement(element: Element): void {
	const names = element
		.getAttributeNames()
		.filter((name, index, array) => array.indexOf(name) === index);

	const {length} = names;

	for (let index = 0; index < length; index += 1) {
		handleAttribute(element, names[index], '');
	}
}

function handleNodes(nodes: NodeList | Node[]): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Element) {
			handleElement(node);
			handleNodes(node.childNodes);
		}
	}
}

const debouncer = debounce(() => {
	handleNodes([document.body]);
}, 25);

const options: MutationObserverInit = {
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
};

let active = false;

const observer = createObserver();

export default observer;
