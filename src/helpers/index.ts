import {controllers} from '../store/controller.store';

export function findTarget(
	origin: Element,
	name: string,
	id?: string,
): EventTarget | undefined {
	const noId = id == null;

	switch (true) {
		case noId && /^document$/i.test(name):
			return origin.ownerDocument ?? document;

		case noId && /^window$/i.test(name):
			return origin.ownerDocument?.defaultView ?? window;

		default:
			return (
				controllers.findContext(origin, name, id)?.element ??
				(noId
					? (origin.ownerDocument.querySelector(`#${name}`) as EventTarget)
					: undefined)
			);
	}
}
