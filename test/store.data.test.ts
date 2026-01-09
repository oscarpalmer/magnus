import {expect, test} from 'vitest';
import {Controller} from '../src';
import {Context} from '../src/controller/context';
import {StoredController} from '../src/store/controller.store';

class DataStoreController extends Controller {}

test('data store', () =>
	new Promise<void>(done => {
		const element = document.createElement('div');
		const context = new Context('test', element, new StoredController(DataStoreController));

		expect(typeof context.controller.data === 'object' && context.controller.data != null).toBe(
			true,
		);

		expect(Object.keys(context.controller.data)).toHaveLength(0);

		context.controller.data.test = 'test';

		expect(context.controller.data.test).toBe('test');

		context.controller.data = {};

		expect(Object.keys(context.controller.data)).toHaveLength(0);

		done();
	}));
