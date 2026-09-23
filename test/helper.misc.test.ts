import {expect, test} from 'vitest';
import {
	removeController,
	removeInput,
	removeOutput,
	removeTarget,
	setController,
	setInput,
	setOutput,
	setTarget,
} from '../src';

const values = [null, undefined, false, true, 123, 123n, [], {}, () => {}, new Map(), new Set()];

test('set & remove controller', () => {
	const element = document.createElement('div');

	setController(element, 'controller');

	expect(element.hasAttribute(':controller')).toBe(true);

	removeController(element, 'controller');

	expect(element.hasAttribute(':controller')).toBe(false);

	for (const value of values) {
		setController(value as never, '');
		setController(element, value as never);

		removeController(value as never, '');
		removeController(element, value as never);
	}
});

test('set & remove input/output', () => {
	const element = document.createElement('div');

	const items = [
		['input', setInput, removeInput],
		['output', setOutput, removeOutput],
	] as const;

	for (const item of items) {
		const [prefix, set, remove] = item;

		set(element, 'controller', 'simple');
		set(element, 'controller', 'pretty', 'pretty');
		set(element, 'controller', 'raw', 'raw');
		set(element, 'controller', 'default', 123 as never);

		expect(element.hasAttribute(`${prefix}:controller.simple`)).toBe(true);
		expect(element.hasAttribute(`${prefix}:controller.pretty:pretty`)).toBe(true);
		expect(element.hasAttribute(`${prefix}:controller.raw:raw`)).toBe(true);
		expect(element.hasAttribute(`${prefix}:controller.default`)).toBe(true);

		remove(element, 'controller', 'simple', 'pretty');
		remove(element, 'controller', 'pretty', 'pretty');
		remove(element, 'controller', 'raw', 'raw');
		remove(element, 'controller', 'default', 123 as never);

		expect(element.hasAttribute(`${prefix}:controller.simple`)).toBe(true);
		expect(element.hasAttribute(`${prefix}:controller.pretty:pretty`)).toBe(false);
		expect(element.hasAttribute(`${prefix}:controller.raw:raw`)).toBe(false);
		expect(element.hasAttribute(`${prefix}:controller.default`)).toBe(false);

		remove(element, 'controller', 'simple');

		expect(element.hasAttribute(`${prefix}:controller.simple`)).toBe(false);
	}

	for (const value of values) {
		setInput(value as never, '', '');
		setInput(element, value as never, '');
		setOutput(value as never, '', '');
		setOutput(element, value as never, '');

		removeInput(value as never, '', '');
		removeInput(element, value as never, '');
		removeOutput(value as never, '', '');
		removeOutput(element, value as never, '');
	}
});

test('set & remove target', () => {
	const element = document.createElement('div');

	setTarget(element, 'controller', 'target');

	expect(element.hasAttribute('target:controller.target')).toBe(true);

	removeTarget(element, 'controller', 'target');

	expect(element.hasAttribute('target:controller.target')).toBe(false);

	for (const value of values) {
		setTarget(value as never, '', '');
		setTarget(element, value as never, '');
		setTarget(element, '', value as never);

		removeTarget(value as never, '', '');
		removeTarget(element, value as never, '');
		removeTarget(element, '', value as never);
	}
});
