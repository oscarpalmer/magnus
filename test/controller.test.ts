import {expect, test} from 'vitest';
import {Controller} from '../src/controller';
import {Context} from '../src/controller/context';
import {Events} from '../src/controller/events';
import {StoredController} from '../src/store/controller.store';

class TestController extends Controller {}

test('controller', () =>
	new Promise<void>(done => {
		const element = document.createElement('div');
		const context = new Context('test', element, new StoredController(TestController));
		const {controller} = context;

		expect(controller.data).toBeInstanceOf(Object);
		expect(controller.element).toBe(element);
		expect(controller.events).toBeInstanceOf(Events);
		expect(controller.name).toBe('test');
		expect(controller.targets).toBeInstanceOf(Object);

		controller.data = {test: true};

		expect(controller.data).toEqual({test: true});

		done();
	}));
