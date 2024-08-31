import {afterAll, expect, test} from 'bun:test';
import {magnus, Controller} from '../src';

class EventsController extends Controller {
	connect() {
		setTimeout(() => {
			const onMultiple = () => {
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

					once += 1;
				},
				{
					once: true,
				},
				'button',
			);
		}, 125);
	}

	onGlobal(event: CustomEvent): void {
		global = event.detail;
	}
}

document.body.innerHTML = `<div
	data-controller="events-test"
	data-action="global->events-test@onGlobal"
>
	<button data-target="events-test.button"></button>
</div>`;

magnus.add('events-test', EventsController);

let global: string | undefined;
let multiple = 0;
let once = 0;

afterAll(() => {
	document.body.innerHTML = '';
});

test('events', done => {
	setTimeout(() => {
		const button = document.querySelector('button');

		for (let index = 0; index < 100; index += 1) {
			button?.click();
		}

		expect(global).toBe('Hello, world!');
		expect(multiple).toBe(10);
		expect(once).toBe(1);

		done();
	}, 250);
});
