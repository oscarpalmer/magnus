import {expect, test} from 'vitest';
import {createActions} from '../src/store/action.store';

test('action store', () => {
	const one = document.createElement('div');
	const two = document.createElement('div');

	const store = createActions();

	expect(store.has('test')).toBe(false);

	store.add('test', one, one);

	expect(store.has('test')).toBe(false);

	store.create(
		{
			callback: () => {},
			name: 'test',
			options: {},
			type: 'test',
		},
		one,
		one,
	);

	expect(store.has('test')).toBe(true);

	store.create(
		{
			callback: () => {},
			name: 'test',
			options: {},
			type: 'test',
		},
		two,
		two,
	);

	store.add('test', two, two);

	store.remove('test', one);

	expect(store.has('test')).toBe(true);

	store.remove('test', two);

	expect(store.has('test')).toBe(false);

	store.remove('test', two);

	expect(store.has('test')).toBe(false);

	store.create(
		{
			callback: () => {},
			name: 'test',
			options: {},
			type: 'test',
		},
		one,
		one,
	);

	expect(store.has('test')).toBe(true);

	store.clear();

	expect(store.has('test')).toBe(false);
});

test('action store: shared target', () => {
	const target = document.createElement('div');
	const one = document.createElement('span');
	const two = document.createElement('span');

	const store = createActions();

	let count = 0;

	store.create(
		{
			callback: () => {
				count += 1;
			},
			name: 'test',
			options: {},
			type: 'test',
		},
		target,
		one,
	);

	store.add('test', target, two);

	target.dispatchEvent(new Event('test'));

	// one listener per target, regardless of origin count
	expect(count).toBe(1);

	store.remove('test', one);

	target.dispatchEvent(new Event('test'));

	expect(count).toBe(2);
	expect(store.has('test')).toBe(true);

	store.remove('test', two);

	target.dispatchEvent(new Event('test'));

	expect(count).toBe(2);
	expect(store.has('test')).toBe(false);
});

test('action store: once', () => {
	const first = document.createElement('div');
	const second = document.createElement('div');
	const one = document.createElement('span');
	const two = document.createElement('span');

	const store = createActions();

	let count = 0;

	function create(target: EventTarget, origin: EventTarget): void {
		store.create(
			{
				callback: () => {
					count += 1;
				},
				name: 'once',
				options: {once: true},
				type: 'test',
			},
			target,
			origin,
		);
	}

	// removed before firing
	create(first, one);

	store.remove('once', one);

	first.dispatchEvent(new Event('test'));

	expect(count).toBe(0);
	expect(store.has('once')).toBe(false);

	// shared target: firing removes the listener for all origins
	create(first, one);

	store.add('once', first, two);

	first.dispatchEvent(new Event('test'));
	first.dispatchEvent(new Event('test'));

	expect(count).toBe(1);
	expect(store.has('once')).toBe(false);

	// multiple targets: firing only removes the fired target
	create(first, one);

	store.add('once', second, two);

	first.dispatchEvent(new Event('test'));
	first.dispatchEvent(new Event('test'));

	expect(count).toBe(2);
	expect(store.has('once')).toBe(true);

	second.dispatchEvent(new Event('test'));
	second.dispatchEvent(new Event('test'));

	expect(count).toBe(3);
	expect(store.has('once')).toBe(false);
});
