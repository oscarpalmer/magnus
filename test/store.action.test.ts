import {expect, test} from 'vitest';
import {Actions} from '../src/store/action.store';

test('action store', () =>
	new Promise<void>(done => {
		const one = document.createElement('div');
		const two = document.createElement('div');

		const store = new Actions();

		expect(store.has('test')).toBe(false);

		store.add('test', one);

		expect(store.has('test')).toBe(false);

		store.create(
			{
				callback: () => {},
				name: 'test',
				options: {},
				type: 'test',
			},
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
		);

		store.add('test', two);

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
		);

		expect(store.has('test')).toBe(true);

		store.clear();

		expect(store.has('test')).toBe(false);

		done();
	}));
