import {expect, test} from 'vitest';
import {Controller} from '../src';
import {createContext} from '../src/controller/context';
import {createStoredController} from '../src/store/controller.store';

class DataStoreController extends Controller {}

test('data store', () => {
	const element = document.createElement('div');
	const context = createContext('test', element, createStoredController(DataStoreController));

	expect(typeof context.controller.data === 'object' && context.controller.data != null).toBe(true);

	expect(Object.keys(context.controller.data)).toHaveLength(0);

	context.controller.data.test = 'test';

	expect(context.controller.data.test).toBe('test');

	context.controller.data = {};

	expect(Object.keys(context.controller.data)).toHaveLength(0);
});
