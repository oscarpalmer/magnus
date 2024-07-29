import type {Observer, ObserverCallback} from '../models';

export function createObserver(
	element: Element,
	options: MutationObserverInit,
	handler: ObserverCallback,
): Observer {
	let running = false;
	let frame: number;

	const observer = new MutationObserver(entries => {
		const {length} = entries;

		for (let index = 0; index < length; index += 1) {
			const entry = entries[index];

			if (entry.type === 'childList') {
				handleNodes(entry.addedNodes, true, handler);
				handleNodes(entry.removedNodes, false, handler);
			} else if (
				entry.type === 'attributes' &&
				entry.target instanceof Element
			) {
				handler(
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

			observer.observe(element, options);

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
				handleNodes([element], true, handler);
			});
		},
	} as Observer);

	if (element.ownerDocument.readyState === 'complete') {
		instance.start();
	} else {
		element.ownerDocument.addEventListener('DOMContentLoaded', () => {
			instance.start();
		});
	}

	return instance;
}

function handleElement(
	element: Element,
	added: boolean,
	handler: ObserverCallback,
): void {
	const attributes = [...element.attributes];
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		handler(element, attributes[index].name, '', added);
	}
}

function handleNodes(
	nodes: NodeList | Node[],
	added: boolean,
	handler: ObserverCallback,
): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Element) {
			handleElement(node, added, handler);
			handleNodes(node.childNodes, added, handler);
		}
	}
}
