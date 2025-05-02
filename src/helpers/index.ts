import {documentPattern, windowPattern} from '../constants';
import {controllers} from '../store/controller.store';

export function findTarget(
	origin: Element,
	name: string,
	id?: string,
): EventTarget | undefined {
	const noId = id == null;

	switch (true) {
		case noId && documentPattern.test(name):
			return document;

		case noId && windowPattern.test(name):
			return window;

		default:
			return (
				controllers.find(origin, name, id)?.state.element ??
				(noId ? (document.querySelector(`#${name}`) as EventTarget) : undefined)
			);
	}
}
