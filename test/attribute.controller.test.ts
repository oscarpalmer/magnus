/** biome-ignore-all lint/style/noMagicNumbers: Testing */
import {afterAll, expect, test} from 'vitest';
import {Controller, magnus} from '../src';

class ControllerController extends Controller {
	connect(): void {
		controller = this;
	}

	disconnect(): void {
		controller = undefined;
	}
}

let controller: ControllerController | undefined;

document.body.innerHTML = '<div :controller-test></div>';

magnus.add('controller-test', ControllerController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('controller attribute', () =>
	new Promise<void>(done => {
		magnus.add('controller-test', ControllerController);

		setTimeout(() => {
			expect(controller).toBeInstanceOf(ControllerController);

			controller?.element.removeAttribute(':controller-test');
		}, 25);

		setTimeout(() => {
			expect(controller).toBeUndefined();

			done();
		}, 50);
	}));
