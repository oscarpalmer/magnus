import {afterAll, expect, test} from 'vitest';
import {Controller, magnus} from '../src';

class OneController extends Controller {
	connect(): void {
		one = this;
	}

	disconnect(): void {
		one = undefined;
	}
}

class TwoController extends Controller {
	connect(): void {
		two = this;
	}

	disconnect(): void {
		two = undefined;
	}
}

let one: OneController | undefined;
let two: TwoController | undefined;

document.body.innerHTML = `<div
	:controller-one
	:controller-two
	:not-real
></div>`;

magnus.add('controller-one', OneController);
magnus.add('controller-two', TwoController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('controller attribute', () =>
	new Promise<void>(done => {
		magnus.add('controller-one', OneController);
		magnus.add('controller-two', TwoController);

		setTimeout(() => {
			expect(one).toBeInstanceOf(OneController);
			expect(two).toBeInstanceOf(TwoController);

			one?.element.removeAttribute(':controller-one');
			one?.element.removeAttribute(':not-real');
		}, 25);

		setTimeout(() => {
			expect(one).toBeUndefined();
			expect(two).toBeInstanceOf(TwoController);

			two?.element.removeAttribute(':controller-two');
		}, 50);

		setTimeout(() => {
			expect(one).toBeUndefined();
			expect(two).toBeUndefined();

			done();
		}, 75);
	}));
