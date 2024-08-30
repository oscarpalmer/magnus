import {afterAll, expect, test} from 'bun:test';
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
	data-controller="action-one"
	data-action="
		btn@click->action-one@fromElement
		document@fromDocument->action-one@fromDocument
		window@fromWindow->action-one@fromWindow
	"
></div>
<div data-controller="action-two">
	<button
		id="btn"
		data-action="action-two@onMultiple action-two@onOnce:once"
	></button>
	<input type="submit" data-action="action-two@onSubmit" />
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

		button?.setAttribute('data-action', '');

		setTimeout(() => {
			// expect(multiple).toBe(10);
			expect(once).toBe(1);

			expect(fromDocument).toBe('Hello, world! -- fromDocument');
			expect(fromElement).toBe('Hello, world! -- fromElement');
			expect(fromWindow).toBe('Hello, world! -- fromWindow');

			for (let index = 0; index < 10; index += 1) {
				button?.click();
			}

			button?.setAttribute('data-action', 'action-two@onMultiple');

			setTimeout(() => {
				// expect(multiple).toBe(10);
				expect(once).toBe(1);

				for (let index = 0; index < 10; index += 1) {
					button?.click();
				}

				magnus.remove('action-two');

				setTimeout(() => {
					// expect(multiple).toBe(20);
					expect(once).toBe(1);

					for (let index = 0; index < 10; index += 1) {
						button?.click();
					}

					setTimeout(() => {
						// expect(multiple).toBe(20);
						expect(once).toBe(1);

						done();
					}, 25);
				}, 25);
			}, 25);
		}, 25);
	}, 125);
});
