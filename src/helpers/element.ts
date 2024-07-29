import {findContext} from '../store/controller.store';

export function findTarget(
	origin: Element,
	name: string,
	id?: string,
): EventTarget | undefined {
	const noId = id == null;

	switch (true) {
		case noId && /^document$/i.test(name):
			return document;
		case noId && /^window$/i.test(name):
			return window;
		default:
			return (
				findContext(origin, name, id)?.element ??
				(noId
					? (origin.ownerDocument.querySelector(`#${id}`) as EventTarget)
					: undefined)
			);
	}
}
