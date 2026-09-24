import {debounce} from '@oscarpalmer/atoms/function/limit';
import {TYPE_DATA} from '../constants';
import {parseAttribute} from '../helpers/attribute.helper';
import type {Observer} from '../models';
import {contexts} from '../store/context.store';
import {handleDataAttribute} from './attributes';
import {handleAttributeChanges} from './attributes/changes.attribute';

// #region Instances

function Observer(this: any) {
	this.observer = new MutationObserver(entries => {
		const {length} = entries;

		for (let index = 0; index < length; index += 1) {
			const entry = entries[index];

			if (entry.type === 'attributes') {
				handleAttribute(entry.target as Element, entry.attributeName as string, false);
			} else {
				handleNodes(entry.addedNodes, false);
				handleNodes(entry.removedNodes, true);
			}
		}
	});

	this.start();
}

Observer.prototype.start = startObserver;
Observer.prototype.stop = stopObserver;
Observer.prototype.update = updateObserver;

// #endregion

// #region Functions

function createObserver(): Observer {
	// @ts-expect-error All good, no worries :-)
	return new Observer() as Observer;
}

function handleAttribute(element: Element, name: string, removed: boolean): void {
	const parsed = parseAttribute(name, element.getAttribute(name));

	if (parsed?.type === TYPE_DATA) {
		handleDataAttribute(element, parsed);
	} else if (parsed != null) {
		handleAttributeChanges(element, parsed, removed);
	}
}

function handleElement(element: Element, removed: boolean): void {
	const names = element.getAttributeNames();

	const {length} = names;

	for (let index = 0; index < length; index += 1) {
		handleAttribute(element, names[index], removed);
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

function startObserver(this: Observer): void {
	this.observer.observe(document.body, options);

	this.update();
}

function stopObserver(this: Observer): void {
	debouncer.cancel();

	this.observer.disconnect();
}

function updateObserver(this: Observer): void {
	debouncer.run();
}

// #endregion

// #region Variables

const debouncer = debounce(() => {
	handleNodes([document.body], false);
}, 25);

const options: MutationObserverInit = {
	attributes: true,
	childList: true,
	subtree: true,
};

export const observer = createObserver();

// #endregion
