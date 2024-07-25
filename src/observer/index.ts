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

type Observer = {
	start(): void;
	stop(): void;
	update(): void;
};

const actionAttribute = 'data-action';
const controllerAttribute = 'data-controller';
const inputAttribute = 'data-input';
const outputAttribute = 'data-output';
const targetAttribute = 'data-target';

const attributes = [
	actionAttribute,
	controllerAttribute,
	inputAttribute,
	outputAttribute,
	targetAttribute,
];

const callbacks: Record<string, AttributeChangeCallback> = {
	[actionAttribute]: handleActionAttribute,
	[controllerAttribute]: handleControllerAttribute,
	[inputAttribute]: handleInputAttribute,
	[outputAttribute]: handleOutputAttribute,
	[targetAttribute]: handleTargetAttribute,
};

export function createObserver(): Observer {
	let running = false;
	let frame: number;

	const observer = new MutationObserver(entries => {
		for (const entry of entries) {
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

	for (const attribute of attributes) {
		handleAttribute(element, attribute.name, '', added);
	}
}

function handleNodes(nodes: NodeList | Node[], added: boolean): void {
	for (const node of nodes) {
		if (node instanceof Element) {
			handleElement(node, added);
			handleNodes(node.childNodes, added);
		}
	}
}
