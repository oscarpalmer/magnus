/** biome-ignore-all lint/style/noMagicNumbers: Testing */
import {afterAll, expect, test} from 'vitest';
import {Controller} from '../src/controller';
import magnus from '../src/magnus';

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

test('controller', () =>
	new Promise<void>(done => {
		expect(magnus.active).toBe(true);
		expect(connected).toBe(0);

		document.body.innerHTML = '<div :magnus-test>1</div>';

		setTimeout(() => {
			expect(magnus.active).toBe(true);
			expect(connected).toBe(1);

			magnus.stop();
			magnus.stop();
		}, 50);

		setTimeout(() => {
			const second = document.createElement('div');

			second.textContent = '2';

			second.setAttribute(':magnus-test', '');

			document.body.append(second);
		}, 100);

		setTimeout(() => {
			expect(magnus.active).toBe(false);
			expect(connected).toBe(1);

			magnus.start();
			magnus.start();
		}, 150);

		setTimeout(() => {
			expect(magnus.active).toBe(true);
			expect(connected).toBe(2);
		}, 200);

		setTimeout(() => {
			magnus.remove('magnus-test');
			magnus.remove('not-exists');

			magnus.stop();
			magnus.stop();
		}, 250);

		setTimeout(() => {
			document.body.innerHTML = '<div :magnus-test>3</div>';
		}, 300);

		setTimeout(() => {
			expect(magnus.active).toBe(false);
			expect(connected).toBe(2);

			magnus.add('magnus-test', TestController);
		}, 350);

		setTimeout(() => {
			magnus.start();
			magnus.start();
		}, 400);

		setTimeout(() => {
			expect(magnus.active).toBe(true);
			expect(connected).toBe(3);

			done();
		}, 450);
	}));
