import {afterAll, expect, test, vi} from 'vitest';
import {Controller, magnus} from '../src';

// cross-controller action bindings resolve via a `requestAnimationFrame` retry
async function nextFrame(): Promise<void> {
	return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

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
	on:action-two.emit="action-one.fromTwo"
	on:action-two.two.emit="action-one.fromTwo"
	on:btn.click="action-one.fromElement ignored also@ignored"
	on:document.from-document="action-one.fromDocument"
	on:window.from-window="action-one.fromWindow"
></div>
<div :action-two id="two">
	<button
		id="btn"
	on:action-two.on-multiple
	on:action-two.on-once:once
	on:action-two.not-real
	on:click="action-two.connect action-two.onA action-two.onB"
	></button>
	<input type="submit" on:action-two.on-submit />
	<input type="text" on:action-two.on-text />
	<div
		on:action-two.this-will.be-ignored
		on:action-two.and-so-will-this
	></div>
</div>`;

magnus.add('action-one', ActionOneController);
magnus.add('action-two', ActionTwoController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('action attribute', async () => {
	await vi.waitFor(() => {
		expect(connected).toBe(1);
	});

	// invalid/dead-end bindings (`not-real`, `this-will.be-ignored`, `and-so-will-this`) retry
	// for up to 10 animation frames before giving up
	for (let index = 0; index < 12; index += 1) {
		await nextFrame();
	}

	const button = document.querySelector('button');

	for (let index = 0; index < 10; index += 1) {
		button?.click();
	}

	button?.removeAttribute('on:action-two.on-multiple');

	await vi.waitFor(() => {
		expect(a).toBe(10);
		expect(b).toBe(10);
		expect(connected).toBe(1);
		expect(fromTwo).toBe(2);
		expect(multiple).toBe(10);
		expect(once).toBe(1);

		expect(fromDocument).toBe('Hello, world! -- fromDocument');
		expect(fromElement).toBe('Hello, world! -- fromElement');
		expect(fromWindow).toBe('Hello, world! -- fromWindow');
	});

	for (let index = 0; index < 10; index += 1) {
		button?.click();
	}

	button?.setAttribute('on:click', 'action-two.onB');
	button?.setAttribute('on:action-two.on-multiple', '');

	await vi.waitFor(() => {
		expect(a).toBe(20);
		expect(b).toBe(20);
		expect(connected).toBe(1);
		expect(fromTwo).toBe(2);
		expect(multiple).toBe(10);
		expect(once).toBe(1);
	});

	for (let index = 0; index < 10; index += 1) {
		button?.click();
	}

	button?.removeAttribute('on:click');

	await nextFrame();

	await vi.waitFor(() => {
		expect(a).toBe(20);
		expect(b).toBe(30);
		expect(connected).toBe(1);
		expect(fromTwo).toBe(2);
		expect(multiple).toBe(10);
		expect(once).toBe(1);
	});

	for (let index = 0; index < 10; index += 1) {
		button?.click();
	}

	// removal detaches listeners synchronously, so further clicks are a no-op immediately
	magnus.remove('action-two');

	for (let index = 0; index < 10; index += 1) {
		button?.click();
	}

	expect(a).toBe(20);
	expect(b).toBe(30);
	expect(connected).toBe(1);
	expect(fromTwo).toBe(2);
	expect(multiple).toBe(10);
	expect(once).toBe(1);
});
