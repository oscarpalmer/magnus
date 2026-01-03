import {afterAll, expect, test} from 'vitest';
import {Controller, magnus} from '../src';

class ObserverController extends Controller {
	connect(): void {
		controller = this;
	}
}

let controller: ObserverController;

afterAll(() => {
	document.body.innerHTML = '';
});

test('observer', () =>
	new Promise<void>(done => {
		expect(controller).toBeUndefined();

		document.body.innerHTML = '<div :observer-test></div>';

		magnus.add('observer-test', ObserverController);

		setTimeout(() => {
			expect(controller).toBeInstanceOf(ObserverController);

			done();
		}, 25);
	}));
