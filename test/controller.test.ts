import {expect, test} from 'vitest';
import {Controller} from '../src/controller';
import {createContext} from '../src/controller/context';
import {createStoredController} from '../src/store/controller.store';

class TestController extends Controller {}

test('controller', () => {
	const element = document.createElement('div');
	const context = createContext('test', element, createStoredController(TestController));
	const {controller} = context;

	expect(controller.element).toBe(element);
	expect(controller.name).toBe('test');

	expect(controller.data).toBeInstanceOf(Object);
	expect(controller.events).toBeInstanceOf(Object);
	expect(controller.targets).toBeInstanceOf(Object);

	controller.data = {test: true};

	expect(controller.data).toEqual({test: true});
});
