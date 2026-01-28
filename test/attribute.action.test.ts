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
	connect(): void {
		connected += 1;
	}

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
let connected = 0;
let fromTwo = 0;
let multiple = 0;
let once = 0;

document.body.innerHTML = `<div
	:action-one
	_action-two.emit="action-one.fromTwo"
	_action-two.two.emit="action-one.fromTwo"
	_btn.click="action-one.fromElement"
	_document.from-document="action-one.fromDocument"
	_window.from-window="action-one.fromWindow"
></div>
<div :action-two id="two">
	<button
		id="btn"
		_action-two.on-multiple
		_action-two.on-once:once
		_action-two.not-real
		_click="action-two.connect action-two.onA action-two.onB"
	></button>
	<input type="submit" _action-two.on-submit />
	<input type="text" _action-two.on-text />
	<div
		_action-two.this-will.be-ignored
		_action-two.and-so-will-this
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

			button?.removeAttribute('_action-two.on-multiple');
		}, 25);

		setTimeout(() => {
			expect(a).toBe(10);
			expect(b).toBe(10);
			expect(connected).toBe(1);
			expect(fromTwo).toBe(2);
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			expect(fromDocument).toBe('Hello, world! -- fromDocument');
			expect(fromElement).toBe('Hello, world! -- fromElement');
			expect(fromWindow).toBe('Hello, world! -- fromWindow');

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			button?.setAttribute('_click', 'action-two.onB');
			button?.setAttribute('_action-two.on-multiple', '');
		}, 50);

		setTimeout(() => {
			expect(a).toBe(20);
			expect(b).toBe(20);
			expect(connected).toBe(1);
			expect(fromTwo).toBe(2);
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			button?.removeAttribute('_click');
		}, 75);

		setTimeout(() => {
			expect(a).toBe(20);
			expect(b).toBe(30);
			expect(connected).toBe(1);
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
			expect(connected).toBe(1);
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
			expect(connected).toBe(1);
			expect(fromTwo).toBe(2);
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			done();
		}, 250);
	}));
