import type {ObserverCallback} from '../models';

export class Observer {
	private frame!: number;
	private readonly observer: MutationObserver;
	private running = false;

	constructor(
		private readonly element: Element,
		private readonly options: MutationObserverInit,
		private readonly handler: ObserverCallback,
	) {
		this.observer = new MutationObserver(entries => {
			const {length} = entries;

			for (let index = 0; index < length; index += 1) {
				const entry = entries[index];

				if (entry.type === 'childList') {
					handleNodes(entry.addedNodes, handler);
					handleNodes(entry.removedNodes, handler);
				} else if (
					entry.type === 'attributes' &&
					entry.target instanceof Element
				) {
					handler(entry.target, entry.attributeName ?? '', entry.oldValue ?? '');
				}
			}
		});
	}

	start() {
		if (this.running) {
			return;
		}

		this.running = true;

		this.observer.observe(this.element, this.options);

		this.update();
	}

	stop() {
		if (!this.running) {
			return;
		}

		this.running = false;

		cancelAnimationFrame(this.frame);

		this.observer.disconnect();
	}

	update() {
		if (!this.running) {
			return;
		}

		cancelAnimationFrame(this.frame);

		this.frame = requestAnimationFrame(() => {
			handleNodes([this.element], this.handler);
		});
	}
}

export function createObserver(
	element: Element,
	options: MutationObserverInit,
	handler: ObserverCallback,
): Observer {
	const instance = new Observer(element, options, handler);

	if (element.ownerDocument.readyState === 'complete') {
		instance.start();
	} else {
		element.ownerDocument.addEventListener('DOMContentLoaded', () => {
			instance.start();
		});
	}

	return instance;
}

function handleElement(element: Element, handler: ObserverCallback): void {
	const attributes = [...element.attributes];
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		handler(element, attributes[index].name, '');
	}
}

function handleNodes(
	nodes: NodeList | Node[],
	handler: ObserverCallback,
): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Element) {
			handleElement(node, handler);
			handleNodes(node.childNodes, handler);
		}
	}
}
