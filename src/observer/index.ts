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

export function createObserver(): Observer {
	let running = false;
	let frame: number;

	const observer = new MutationObserver(entries => {
		const {length} = entries;

		for (let index = 0; index < length; index += 1) {
			const entry = entries[index];

			if (entry.type === 'childList') {
				handleNodes(entry.addedNodes, true);
				handleNodes(entry.removedNodes, false);
			} else if (
				entry.type === 'attributes' &&
				entry.target instanceof Element
			) {
				handleAttribute(
					entry.target,
					entry.attributeName ?? '',
					entry.oldValue ?? '',
					true,
				);
			}
		}
	});

	const instance: Observer = Object.create({
		start() {
			if (running) {
				return;
			}

			running = true;

			observer.observe(document.body, {
				attributeFilter: attributes,
				attributeOldValue: true,
				attributes: true,
				childList: true,
				subtree: true,
			});

			this.update();
		},
		stop() {
			if (!running) {
				return;
			}

			running = false;

			cancelAnimationFrame(frame);

			observer.disconnect();
		},
		update() {
			if (!running) {
				return;
			}

			cancelAnimationFrame(frame);

			frame = requestAnimationFrame(() => {
				handleNodes([document.body], true);
			});
		},
	} as Observer);

	if (document.body.ownerDocument.readyState === 'complete') {
		instance.start();
	} else {
		document.body.ownerDocument.addEventListener('DOMContentLoaded', () => {
			instance.start();
		});
	}

	return instance;
}

function handleAttribute(
	element: Element,
	name: string,
	value: string,
	added: boolean,
): void {
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
}

function handleElement(element: Element, added: boolean): void {
	const attributes = [...element.attributes];
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		handleAttribute(element, attributes[index].name, '', added);
	}
}

function handleNodes(nodes: NodeList | Node[], added: boolean): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Element) {
			handleElement(node, added);
			handleNodes(node.childNodes, added);
		}
	}
}
