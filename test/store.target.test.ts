import {expect, test} from 'vitest';
import {Controller} from '../src/controller';
import {Context} from '../src/controller/context';
import {StoredController} from '../src/store/controller.store';
import {Targets} from '../src/store/target.store';

class TargetsController extends Controller {}

test('target store', () =>
	new Promise<void>(done => {
		const context = new Context('targets', document.body, new StoredController(TargetsController));
		const store = new Targets(context);

		const one = document.createElement('div');
		const two = document.createElement('div');

		expect(store.has('items')).toBe(false);

		store.add('item', one);

		expect(store.has('item')).toBe(true);

		store.add('item', two);

		expect(store.has('item')).toBe(true);

		store.remove('item', one);

		expect(store.has('item')).toBe(true);

		store.remove('item', two);

		expect(store.has('item')).toBe(false);

		expect(store.find(123 as never)).toBeNull();
		expect(store.findAll(123 as never)).toEqual([]);
		expect(store.get(123 as never)).toBeUndefined();
		expect(store.getAll(123 as never)).toEqual([]);
		expect(store.has(123 as never)).toBe(false);

		done();
	}));
