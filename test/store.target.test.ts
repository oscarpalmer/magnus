import {expect, test} from 'vitest';
import {Controller} from '../src/controller';
import {Context} from '../src/controller/context';
import {Targets} from '../src/store/target.store';

class TargetsController extends Controller {}

test('target store', () => {
	const context = new Context('targets', document.body, TargetsController);
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
});
