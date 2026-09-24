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
