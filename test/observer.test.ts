import {afterAll, expect, test} from 'bun:test';
import {Controller, magnus} from '../src';

class ObserverController extends Controller {
	connect(): void {
		controller = this;
	}
}

let controller: ObserverController;

document.body.innerHTML = `<div data-controller="observer-test"></div>`;

magnus.stop();
magnus.add('observer-test', ObserverController);

afterAll(() => {
	document.body.innerHTML = '';

	magnus.start();
});

test('observer', done => {
	setTimeout(() => {
		expect(controller).toBeUndefined();

		magnus.start();

		setTimeout(() => {
			expect(controller).toBeInstanceOf(ObserverController);

			done();
		}, 25);
	}, 125);
});
