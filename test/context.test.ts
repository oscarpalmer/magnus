import {expect, test} from 'vitest';
import {Controller} from '../src/controller';
import {createContext} from '../src/controller/context';
import {createStoredController} from '../src/store/controller.store';

class TestController extends Controller {}

test('context', () =>
	new Promise<void>(done => {
		const element = document.createElement('div');
		const context = createContext('test', element, createStoredController(TestController));

		expect(context.controller).toBeInstanceOf(TestController);
		expect(context.state.element).toBe(element);
		expect(context.state.name).toBe('test');

		expect(context.actions).toBeInstanceOf(Object);
		expect(context.data).toBeInstanceOf(Object);
		expect(context.events).toBeInstanceOf(Object);
		expect(context.targets).toBeInstanceOf(Object);

		done();
	}));
