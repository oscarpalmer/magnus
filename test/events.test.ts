import {noop} from '@oscarpalmer/atoms/function';
import {afterAll, expect, test, vi} from 'vitest';
import {Controller, magnus} from '../src';

class EventsController extends Controller {
	connect(): void {
		const onMultiple = (): void => {
			multiple += 1;

			if (multiple === 10) {
				this.events.off('click', onMultiple, 'button');
			}
		};

		this.events.on('click', onMultiple, 'button');

		this.events.on(
			'click',
			() => {
				this.events.dispatch('global', {
					detail: 'Hello, world!',
				});

				this.events.dispatch(
					'global',
					{
						detail: true,
					},
					'invalid',
				);

				this.events.dispatch('global', 'invalid');

				once += 1;
			},
			{
				once: true,
			},
			'button',
		);

		listener = this.events.on(
			'click',
			() => {
				invalidOn = true;
			},
			'invalid',
		);
	}

	onGlobal(event: CustomEvent): void {
		global = event.detail;
	}
}

document.body.innerHTML = `<div
	:events-test
	on:global="events-test.onGlobal"
>
	<button events-test:button></button>
</div>`;

magnus.add('events-test', EventsController);

let global: string | undefined;
let listener: unknown;

let invalidOn = false;
let multiple = 0;
let once = 0;

afterAll(() => {
	document.body.innerHTML = '';
});

test('events', async () => {
	await vi.waitFor(() => {
		expect(listener).toBe(noop);
	});

	const button = document.querySelector('button');

	for (let index = 0; index < 100; index += 1) {
		button?.click();
	}

	expect(global).toBe('Hello, world!');
	expect(invalidOn).toBe(false);
	expect(listener).toBe(noop);
	expect(multiple).toBe(10);
	expect(once).toBe(1);
});
