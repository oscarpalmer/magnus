import {expect, test} from 'vitest';
import {removeController, removeTarget, setController, setTarget} from '../src';

const values = [null, undefined, false, true, 123, 123n, [], {}, () => {}, new Map(), new Set()];

test('set & remove controller', () => {
	const element = document.createElement('div');

	setController(element, 'test');

	expect(element.hasAttribute(':test')).toBe(true);

	removeController(element, 'test');

	expect(element.hasAttribute(':test')).toBe(false);

	for (const value of values) {
		setController(value as never, '');
		setController(element, value as never);

		removeController(value as never, '');
		removeController(element, value as never);
	}
});

test('set & remove target', () => {
	const element = document.createElement('div');

	setTarget(element, 'test', 'item');

	expect(element.hasAttribute('target:test.item')).toBe(true);

	removeTarget(element, 'test', 'item');

	expect(element.hasAttribute('target:test.item')).toBe(false);

	for (const value of values) {
		setTarget(value as never, '', '');
		setTarget(element, value as never, '');
		setTarget(element, '', value as never);

		removeTarget(value as never, '', '');
		removeTarget(element, value as never, '');
		removeTarget(element, '', value as never);
	}
});
