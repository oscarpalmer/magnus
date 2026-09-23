import {afterAll, expect, test, vi} from 'vitest';
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

test('observer', async () => {
	expect(controller).toBeUndefined();

	document.body.innerHTML = '<div :observer-test></div>';

	magnus.add('observer-test', ObserverController);

	await vi.waitFor(() => {
		expect(controller).toBeInstanceOf(ObserverController);
	});
});
