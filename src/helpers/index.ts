import type {PlainObject} from '@oscarpalmer/atoms/models';
import {DATA_TYPES, EXPRESSION_DOCUMENT, EXPRESSION_WINDOW} from '../constants';
import type {ControllerDataTypes} from '../models';
import {controllers} from '../store/controller.store';

export function getDataTypes(input: unknown): ControllerDataTypes {
	const types = {};

	if (typeof input !== 'object' || input === null) {
		return types;
	}

	const keys = Object.keys(input as PlainObject);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = (input as PlainObject)[key];

		if (DATA_TYPES.has(value as never)) {
			(types as PlainObject)[key] = value;
		}
	}

	return types;
}

export function findTarget(origin: Element, name: string, id?: string): EventTarget | undefined {
	const noId = id == null;

	switch (true) {
		case noId && EXPRESSION_DOCUMENT.test(name):
			return document;

		case noId && EXPRESSION_WINDOW.test(name):
			return window;

		default:
			return (
				controllers.find(origin, name, id)?.state.element ??
				(noId ? (document.querySelector(`#${name}`) as EventTarget) : undefined)
			);
	}
}
