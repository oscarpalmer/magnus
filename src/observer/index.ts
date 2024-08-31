import type {ObserverCallback} from '../models';

export class Observer {
		private frame!: number;
		private readonly observer: MutationObserver;
		private running = false;

		constructor(
			private readonly element: Element,
			private readonly options: MutationObserverInit,
			private readonly callback: ObserverCallback,
		) {
			this.observer = new MutationObserver(entries => {
				const {length} = entries;

				for (let index = 0; index < length; index += 1) {
					const entry = entries[index];

					if (entry.type === 'childList') {
						handleNodes(entry.addedNodes, callback);
						handleNodes(entry.removedNodes, callback);
					} else if (
						entry.type === 'attributes' &&
						entry.target instanceof Element
					) {
						callback(
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

				this.observer.observe(this.element, this.options);

				this.update();
			}
		}

		stop() {
			if (this.running) {
				this.running = false;

				cancelAnimationFrame(this.frame);

				this.observer.disconnect();
			}
		}

		update() {
			if (this.running) {
				cancelAnimationFrame(this.frame);

				this.frame = requestAnimationFrame(() => {
					handleNodes([this.element], this.callback);
				});
			}
		}
	}

export function createObserver(
		element: Element,
		options: MutationObserverInit,
		callback: ObserverCallback,
	): Observer {
		const instance = new Observer(element, options, callback);

		if (element.ownerDocument.readyState === 'complete') {
			instance.start();
		} else {
			element.ownerDocument.addEventListener('DOMContentLoaded', () => {
				instance.start();
			});
		}

		return instance;
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
