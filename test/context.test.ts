import {expect, test} from 'vitest';
import {Controller} from '../src/controller';
import {Context} from '../src/controller/context';
import {Events} from '../src/controller/events';
import {Actions} from '../src/store/action.store';
import {Data} from '../src/store/data.store';
import {Targets} from '../src/store/target.store';

class TestController extends Controller {}

test('context', () => {
	const element = document.createElement('div');
	const context = new Context('test', element, TestController);

	expect(context.actions).toBeInstanceOf(Actions);
	expect(context.controller).toBeInstanceOf(TestController);
	expect(context.data).toBeInstanceOf(Data);
	expect(context.state.element).toBe(element);
	expect(context.events).toBeInstanceOf(Events);
	expect(context.state.name).toBe('test');
	expect(context.targets).toBeInstanceOf(Targets);
});
