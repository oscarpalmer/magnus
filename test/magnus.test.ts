import {afterAll, expect, test, vi} from 'vitest';
import {magnus, setController} from '../src';
import {Controller} from '../src/controller';

class TestController extends Controller {
	connect(): void {
		connected += 1;
	}
}

magnus.add('magnus-test', TestController);
magnus.add('magnus-test', TestController);

let connected = 0;

afterAll(() => {
	document.body.innerHTML = '';
});

test('controller', async () => {
	expect(magnus.active).toBe(true);
	expect(connected).toBe(0);

	document.body.innerHTML = '<div :magnus-test>1</div>';

	await vi.waitFor(() => {
		expect(connected).toBe(1);
	});

	expect(magnus.active).toBe(true);

	magnus.stop();
	magnus.stop();

	const second = document.createElement('div');

	second.textContent = '2';

	setController(second, 'magnus-test');

	document.body.append(second);

	expect(magnus.active).toBe(false);
	expect(connected).toBe(1);

	magnus.start();
	magnus.start();

	await vi.waitFor(() => {
		expect(connected).toBe(2);
	});

	expect(magnus.active).toBe(true);

	magnus.remove('magnus-test');
	magnus.remove('not-exists');

	magnus.stop();
	magnus.stop();

	document.body.innerHTML = '<div :magnus-test>3</div>';

	expect(magnus.active).toBe(false);
	expect(connected).toBe(2);

	magnus.add('magnus-test', TestController);

	magnus.start();
	magnus.start();

	// re-registering while stopped doesn't retroactively (synchronously) reconnect existing elements
	expect(magnus.active).toBe(true);
	expect(connected).toBe(2);
});
