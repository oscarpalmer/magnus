export type Observer = {
	handleElement(element: Element, added: boolean): void;
	handleNodes(nodes: NodeList | Node[], added: boolean): void;
	start(): void;
	stop(): void;
	update(): void;
};

export const options: MutationObserverInit = {
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
};

export function createObserver(
	element: Element,
	options: MutationObserverInit,
	attributeHandler: (
		element: Element,
		name: string,
		value: string,
		added: boolean,
	) => void,
): Observer {
	let frame: number;

	const observer = new MutationObserver(entries => {
		for (const entry of entries) {
			if (entry.type === 'childList') {
				instance.handleNodes(entry.addedNodes, true);
				instance.handleNodes(entry.removedNodes, false);
			} else if (
				entry.type === 'attributes' &&
				entry.target instanceof Element
			) {
				attributeHandler(
					entry.target,
					entry.attributeName ?? '',
					entry.oldValue ?? '',
					true,
				);
			}
		}
	});

	const instance: Observer = Object.create({
		handleElement(element: Element, added: boolean) {
			const attributes = [...element.attributes];

			for (const attribute of attributes) {
				attributeHandler(element, attribute.name, '', added);
			}
		},
		handleNodes(nodes, added) {
			for (const node of nodes) {
				if (node instanceof Element) {
					this.handleElement(node, added);
					this.handleNodes(node.childNodes, added);
				}
			}
		},
		start() {
			observer.observe(element, options);

			this.update();
		},
		stop() {
			observer.disconnect();
		},
		update() {
			cancelAnimationFrame(frame);

			frame = requestAnimationFrame(() => {
				this.handleNodes([element], true);
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
