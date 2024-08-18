import {afterAll, expect, test} from 'bun:test';
import {magnus, Controller} from '../src';

class ActionOneController extends Controller {
	onGlobal(event: CustomEventInit) {
		global = event.detail;
	}
}

class ActionTwoController extends Controller {
	onMultiple() {
		multiple += 1;
	}

	onOnce() {
		this.events.dispatch(
			'global',
			{
				detail: 'Hello, world!',
			},
			document,
		);

		once += 1;
	}
}

let global: string | undefined;
let multiple = 0;
let once = 0;

document.body.innerHTML = `<div
	data-controller="action-one"
	data-action="document@global->action-one@onGlobal"
></div>
<div data-controller="action-two">
	<button
		data-action="action-two@onMultiple action-two@onOnce:once"
	></button>
	<div
		data-action="this-will@be-ignored action-two@and-so-will-this"
	></div>
</div>`;

magnus.add('action-one', ActionOneController);
magnus.add('action-two', ActionTwoController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('action attribute', done => {
	setTimeout(() => {
		const button = document.querySelector('button');

		for (let index = 0; index < 10; index += 1) {
			button?.click();
		}

		button?.removeAttribute('data-action');

		setTimeout(() => {
			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			expect(global).toBe('Hello, world!');
			expect(multiple).toBe(10);
			expect(once).toBe(1);

			done();
		}, 125);
	}, 125);
});
