import {afterAll, expect, test} from 'vitest';
import {Controller, magnus} from '../src';

type Data = {
	check: boolean;
	number: number;
	radio: string;
	select: number;
	text: string;
};

class DataController extends Controller<Data> {
	static readonly types = {
		check: 'boolean',
		number: 'number',
		radio: 'string',
		select: 'number',
		text: 'string',
	} as never;

	connect(): void {
		controller = this;

		allOutput = this.targets.find('div') as HTMLDivElement;
		numberJsonOutput = this.targets.find('var') as HTMLSpanElement;
		numberRawOutput = this.targets.find('span') as HTMLElement;
	}
}

document.body.innerHTML = `<div
	:d
	d-check="true"
	d-number="123"
	d-radio="alpha"
	d-select="1"
	d-text="Hello, world!"
>
	<input d.check type="checkbox" />

	<input d.number type="number" />

	<fieldset>
		<legend>Radio</legend>
		<input d.radio name="radio" type="radio" value="alpha" />
		<input d.radio name="radio" type="radio" value="omega" />
	</fieldset>

	<select d.select>
		<option value="0">Zero</option>
		<option value="1">One</option>
		<option value="2">Two</option>
	</select>

	<textarea d.text></textarea>

	<p><span d.number>123</span>, <var d.number:json></var></p>

	<div d.:json></div>
</div>`;

magnus.add('d', DataController);

let allOutput: HTMLDivElement;
let controller: DataController;
let numberJsonOutput: HTMLElement;
let numberRawOutput: HTMLSpanElement;

afterAll(() => {
	document.body.innerHTML = '';
});

test('data attribute', () =>
	new Promise<void>(done => {
		setTimeout(() => {
			expect(controller.data).toEqual({
				check: true,
				number: 123,
				radio: 'alpha',
				select: 1,
				text: 'Hello, world!',
			});

			expect(numberJsonOutput.textContent).toBe('123');
			expect(numberRawOutput.textContent).toBe('123');
			expect(allOutput.textContent).toBe(JSON.stringify(controller.data));

			controller.data.check = false;
			controller.data.number = 123;
			controller.data.radio = 'omega';
			controller.data.select = 2;
			controller.data.text = 'Goodbye, world!';
		}, 125);

		setTimeout(() => {
			expect(controller.data).toEqual({
				check: false,
				number: 123,
				radio: 'omega',
				select: 2,
				text: 'Goodbye, world!',
			});

			expect(numberJsonOutput.textContent).toBe('123');
			expect(numberRawOutput.textContent).toBe('123');
			expect(allOutput.textContent).toBe(JSON.stringify(controller.data));

			controller.data = {
				check: true,
				number: 456,
				radio: 'alpha',
				select: 0,
				text: 'Hello, world!',
			};
		}, 250);

		setTimeout(() => {
			expect(controller.data).toEqual({
				check: true,
				number: 456,
				radio: 'alpha',
				select: 0,
				text: 'Hello, world!',
			});

			expect(numberJsonOutput.textContent).toBe('456');
			expect(numberRawOutput.textContent).toBe('456');
			expect(allOutput.textContent).toBe(JSON.stringify(controller.data));

			controller.data = {
				ignored: null,
				number: 789,
				state: 0,
				text: 'Spring cleaning :)',
			} as never;
		}, 375);

		setTimeout(() => {
			expect(controller.data).toEqual({
				check: false,
				number: 789,
				select: 0,
				state: 0,
				text: 'Spring cleaning :)',
			});

			expect(numberJsonOutput.textContent).toBe('789');
			expect(numberRawOutput.textContent).toBe('789');
			expect(allOutput.textContent).toBe(JSON.stringify(controller.data));

			controller.data.number = undefined as never;
		}, 500);

		setTimeout(() => {
			expect(controller.data).toEqual({
				check: false,
				select: 0,
				state: 0,
				text: 'Spring cleaning :)',
			});

			expect(numberJsonOutput.textContent).toBe('');
			expect(numberRawOutput.textContent).toBe('');
			expect(allOutput.textContent).toBe(JSON.stringify(controller.data));

			controller.element.setAttribute('d-check', 'true');
			controller.element.setAttribute('d-text', 'Hello, again!');
		}, 1125);

		setTimeout(() => {
			expect(controller.data).toEqual({
				check: true,
				select: 0,
				state: 0,
				text: 'Hello, again!',
			});

			expect(numberJsonOutput.textContent).toBe('');
			expect(numberRawOutput.textContent).toBe('');
			expect(allOutput.textContent).toBe(JSON.stringify(controller.data));

			controller.element.setAttribute('d-check', '');
			controller.element.setAttribute('d-text', 'Hello, again!');
		}, 1250);

		setTimeout(() => {
			expect(controller.data).toEqual({
				check: false,
				select: 0,
				state: 0,
				text: 'Hello, again!',
			});

			expect(numberJsonOutput.textContent).toBe('');
			expect(numberRawOutput.textContent).toBe('');
			expect(allOutput.textContent).toBe(JSON.stringify(controller.data));

			controller.data = null;
		}, 1375);

		setTimeout(() => {
			expect(controller.data).toEqual({
				check: false,
				select: 0,
				text: '',
			});

			expect(numberJsonOutput.textContent).toBe('');
			expect(numberRawOutput.textContent).toBe('');
			expect(allOutput.textContent).toBe(JSON.stringify(controller.data));

			done();
		}, 1500);
	}));
