/** biome-ignore-all lint/style/noMagicNumbers: Testing */
import {afterAll, expect, test} from 'vitest';
import {Controller, magnus} from '../src';

class ActionOneController extends Controller {
	fromDocument(event: CustomEventInit): void {
		fromDocument = event.detail;
	}

	fromElement(): void {
		fromElement = 'Hello, world! -- fromElement';
	}

	fromTwo(): void {
		fromTwo += 1;
	}

	fromWindow(event: CustomEventInit): void {
		fromWindow = event.detail;
	}
}

class ActionTwoController extends Controller {
	onA(): void {
		a += 1;
	}

	onB(): void {
		b += 1;
	}

	onMultiple(): void {
		multiple += 1;
	}

	onOnce(): void {
		for (const type of ['fromDocument', 'fromWindow']) {
			this.events.dispatch(
				type,
				{
					detail: `Hello, world! -- ${type}`,
				},
				type === 'fromDocument' ? document : window,
			);
		}

		this.events.dispatch('emit');

		once += 1;
	}

	onSubmit(): void {
		// ?
	}

	onText(): void {
		// ?
	}
}

let fromDocument: string | undefined;
let fromElement: string | undefined;
let fromWindow: string | undefined;

let a = 0;
let b = 0;
let fromTwo = 0;
let multiple = 0;
let once = 0;

document.body.innerHTML = `<div
	:action-one
	::action-two.emit="action-one@fromTwo"
	::action-two.two.emit="action-one@fromTwo"
	::btn.click="action-one@fromElement"
	::document.from-document="action-one@fromDocument"
	::window.from-window="action-one@fromWindow"
></div>
<div :action-two id="two">
	<button
		id="btn"
		::action-two.on-multiple
		::action-two.on-once:once
		::action-two.not-real
		::click="action-two@onA action-two@onB"
	></button>
	<input type="submit" ::action-two.on-submit />
	<input type="text" ::action-two.on-text />
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
		let button: HTMLButtonElement | null;

		setTimeout(() => {
			button = document.querySelector('button');

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			button?.removeAttribute('::action-two.on-multiple');
		}, 25);

		setTimeout(() => {
			expect(a).toBe(10);
			expect(b).toBe(10);
			expect(fromTwo).toBe(2);
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			expect(fromDocument).toBe('Hello, world! -- fromDocument');
			expect(fromElement).toBe('Hello, world! -- fromElement');
			expect(fromWindow).toBe('Hello, world! -- fromWindow');

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			button?.setAttribute('::click', 'action-two@onB');
			button?.setAttribute('::action-two.on-multiple', '');
		}, 50);

		setTimeout(() => {
			expect(a).toBe(20);
			expect(b).toBe(20);
			expect(fromTwo).toBe(2);
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			button?.removeAttribute('::click');
		}, 75);

		setTimeout(() => {
			expect(a).toBe(20);
			expect(b).toBe(30);
			expect(fromTwo).toBe(2);
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			magnus.remove('action-two');
		}, 100);

		setTimeout(() => {
			expect(a).toBe(20);
			expect(b).toBe(30);
			expect(fromTwo).toBe(2);
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}
		}, 125);

		setTimeout(() => {
			expect(a).toBe(20);
			expect(b).toBe(30);
			expect(fromTwo).toBe(2);
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			done();
		}, 150);
	}));
