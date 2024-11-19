import {debounce} from '@oscarpalmer/atoms';
import {getAttributeType} from '../helpers/attribute';
import type {ObserverCallback} from '../models';
import {handleAttributeChanges} from './attributes/changes.attribute';

const debouncer = debounce(() => {
	handleNodes([document.body], handleChanges);
}, 250);

export class Observer {
	private readonly observer: MutationObserver;

	private readonly options: MutationObserverInit = {
		attributeOldValue: true,
		attributes: true,
		childList: true,
		subtree: true,
	};

	private running = false;

	constructor() {
		this.observer = new MutationObserver(entries => {
			const {length} = entries;

			for (let index = 0; index < length; index += 1) {
				const entry = entries[index];

				if (entry.type === 'childList') {
					handleNodes(entry.addedNodes, handleChanges);
					handleNodes(entry.removedNodes, handleChanges);
				} else if (
					entry.type === 'attributes' &&
					entry.target instanceof Element
				) {
					handleChanges(
						entry.target,
						entry.attributeName ?? '',
						entry.oldValue ?? '',
					);
				}
			}
		});
	}

	start() {
		if (!this.running) {
			this.running = true;

			this.observer.observe(document.body, this.options);

			this.update();
		}
	}

	stop() {
		if (this.running) {
			this.running = false;

			debouncer.cancel();

			this.observer.disconnect();
		}
	}

	update() {
		if (this.running) {
			console.log('update');
			debouncer();
		}
	}
}

function createObserver(): Observer {
	const instance = new Observer();

	if (document.readyState === 'complete') {
		instance.start();
	} else {
		document.addEventListener('DOMContentLoaded', () => {
			instance.start();
		});
	}

	return instance;
}

function handleChanges(element: Element, name: string, value: string): void {
	const type = getAttributeType(name);

	if (type != null) {
		handleAttributeChanges(type, element, name, value, false);
	}
}

function handleElement(element: Element, callback: ObserverCallback): void {
	const attributes = [...element.attributes];
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		callback(element, attributes[index].name, '');
	}
}

function handleNodes(
	nodes: NodeList | Node[],
	callback: ObserverCallback,
): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Element) {
			handleElement(node, callback);
			handleNodes(node.childNodes, callback);
		}
	}
}

const observer = createObserver();

export {observer};
