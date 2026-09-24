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
		expect(multiple).toBe(20);
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
	expect(multiple).toBe(30);
	expect(once).toBe(1);
});

test('action attribute: shared external binding', async () => {
	let pinged = 0;

	magnus.add('shared-source', class extends Controller {});

	magnus.add(
		'shared-listener',
		class extends Controller {
			onPing(): void {
				pinged += 1;
			}
		},
	);

	const container = document.createElement('div');

	container.innerHTML = `<div :shared-source id="shared-source"></div>
<div :shared-listener>
	<span id="shared-one" on:shared-source.ping="shared-listener.onPing"></span>
	<span id="shared-two" on:shared-source.ping="shared-listener.onPing"></span>
</div>`;

	document.body.append(container);

	for (let index = 0; index < 3; index += 1) {
		await nextFrame();
	}

	const source = container.querySelector('#shared-source') as Element;

	source.dispatchEvent(new Event('ping'));

	// both origins share a single listener on the external target
	expect(pinged).toBe(1);

	container.querySelector('#shared-one')?.removeAttribute('on:shared-source.ping');

	await nextFrame();

	source.dispatchEvent(new Event('ping'));

	expect(pinged).toBe(2);

	container.querySelector('#shared-two')?.removeAttribute('on:shared-source.ping');

	await nextFrame();

	source.dispatchEvent(new Event('ping'));

	expect(pinged).toBe(2);

	container.remove();
});

test('action attribute: removal after external target is gone', async () => {
	let pinged = 0;

	magnus.add('gone-source', class extends Controller {});

	magnus.add(
		'gone-listener',
		class extends Controller {
			onPing(): void {
				pinged += 1;
			}
		},
	);

	const container = document.createElement('div');

	container.innerHTML = `<div :gone-source id="gone-source"></div>
<div :gone-listener>
	<span on:gone-source.ping="gone-listener.onPing"></span>
</div>`;

	document.body.append(container);

	for (let index = 0; index < 3; index += 1) {
		await nextFrame();
	}

	const source = container.querySelector('#gone-source') as Element;

	source.dispatchEvent(new Event('ping'));

	expect(pinged).toBe(1);

	source.remove();

	await nextFrame();

	container.querySelector('span')?.removeAttribute('on:gone-source.ping');

	await nextFrame();

	// removal must not depend on resolving the (now detached) external target again
	source.dispatchEvent(new Event('ping'));

	expect(pinged).toBe(1);

	container.remove();
});

test('action attribute: removal does not retry', async () => {
	magnus.add('no-retry', class extends Controller {});

	const container = document.createElement('div');

	container.innerHTML = `<div :no-retry>
	<button on:no-retry.does-not-exist></button>
</div>`;

	document.body.append(container);

	// let the add-side retries for the missing method run out
	for (let index = 0; index < 12; index += 1) {
		await nextFrame();
	}

	const spy = vi.spyOn(globalThis, 'requestAnimationFrame');

	container.querySelector('button')?.removeAttribute('on:no-retry.does-not-exist');

	await new Promise(resolve => setTimeout(resolve, 0));

	expect(spy).not.toHaveBeenCalled();

	spy.mockRestore();

	container.remove();
});
