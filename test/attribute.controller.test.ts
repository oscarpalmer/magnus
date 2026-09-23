import {afterAll, expect, test, vi} from 'vitest';
import {Controller, magnus, removeController} from '../src';

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

test('controller attribute', async () => {
	magnus.add('controller-one', OneController);
	magnus.add('controller-two', TwoController);

	await vi.waitFor(() => {
		expect(one).toBeInstanceOf(OneController);
		expect(two).toBeInstanceOf(TwoController);
	});

	if (one != null) {
		removeController(one.element, 'controller-one');
		removeController(one.element, 'not-real');
	}

	await vi.waitFor(() => {
		expect(one).toBeUndefined();
		expect(two).toBeInstanceOf(TwoController);
	});

	if (two != null) {
		removeController(two.element, 'controller-two');
	}

	await vi.waitFor(() => {
		expect(one).toBeUndefined();
		expect(two).toBeUndefined();
	});
});
