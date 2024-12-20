import {afterAll, expect, test} from 'vitest';
import {magnus, Controller} from '../src';

class ActionOneController extends Controller {
	fromDocument(event: CustomEventInit) {
		fromDocument = event.detail;
	}

	fromElement() {
		fromElement = 'Hello, world! -- fromElement';
	}

	fromWindow(event: CustomEventInit) {
		fromWindow = event.detail;
	}
}

class ActionTwoController extends Controller {
	onMultiple() {
		multiple += 1;
	}

	onOnce() {
		for (const type of ['fromDocument', 'fromWindow']) {
			this.events.dispatch(
				type,
				{
					detail: `Hello, world! -- ${type}`,
				},
				type === 'fromDocument' ? document : window,
			);
		}

		once += 1;
	}
}

let fromDocument: string | undefined;
let fromElement: string | undefined;
let fromWindow: string | undefined;
let multiple = 0;
let once = 0;

document.body.innerHTML = `<div
	:action-one
	::btn.click="action-one.fromElement"
	::document.from-document="action-one.fromDocument"
	::window.from-window="action-one.fromWindow"
></div>
<div :action-two>
	<button
		id="btn"
		::action-two.on-multiple
		::action-two.on-once:once
	></button>
	<input type="submit" ::action-two.on-submit />
	<div
		::this-will.be-ignored
		::action-two.and-so-will-this
	></div>
</div>`;

magnus.add('action-one', ActionOneController);
magnus.add('action-two', ActionTwoController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('action attribute', () =>
	new Promise<void>(done => {
		setTimeout(() => {
			const button = document.querySelector('button');

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			button?.removeAttribute(`\:\:action-two.on-multiple`);

			setTimeout(() => {
				expect(multiple).toBe(10);
				expect(once).toBe(1);

				expect(fromDocument).toBe('Hello, world! -- fromDocument');
				expect(fromElement).toBe('Hello, world! -- fromElement');
				expect(fromWindow).toBe('Hello, world! -- fromWindow');

				for (let index = 0; index < 10; index += 1) {
					button?.click();
				}

				button?.setAttribute(`\:\:action-two.on-multiple`, '');

				setTimeout(() => {
					expect(multiple).toBe(10);
					expect(once).toBe(1);

					for (let index = 0; index < 10; index += 1) {
						button?.click();
					}

					magnus.remove('action-two');

					setTimeout(() => {
						expect(multiple).toBe(20);
						expect(once).toBe(1);

						for (let index = 0; index < 10; index += 1) {
							button?.click();
						}

						setTimeout(() => {
							expect(multiple).toBe(20);
							expect(once).toBe(1);

							done();
						}, 25);
					}, 25);
				}, 25);
			}, 25);
		}, 25);
	}));
