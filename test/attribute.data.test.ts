import {afterAll, expect, test} from 'vitest';
import {Controller, magnus} from '../src';

type Data = {
	array: unknown[];
	check: boolean;
	date: string;
	datetime: string;
	number: number;
	object: object;
	radio: string;
	select: number;
	text: string;
	time: string;
};

class DataController extends Controller<Data> {
	static readonly types = {
		array: 'array',
		check: 'boolean',
		date: 'date',
		datetime: 'datetime',
		number: 'number',
		object: 'object',
		radio: 'string',
		select: 'number',
		text: 'not-real',
		time: 'time',
	} as never;

	connect(): void {
		controller = this;

		allOutput = this.targets.find('div');
		numberJsonOutput = this.targets.find('var');
		numberRawOutput = this.targets.find('span');
	}
}

document.body.innerHTML = `<div
	:d
	d-array="[1, 2, 3]"
	d-check="true"
	d-date="1992-01-02"
	d-datetime="1992-01-02T12:34:56"
	d-number="123"
	d-object='{"key": "value"}'
	d-radio="alpha"
	d-select="1"
	d-text="Hello, world!"
	d-time="12:34:56.789"
>
	<input d.check type="checkbox" />
	<input d.date type="date" />
	<input d.datetime type="datetime-local" />
	<input d.number type="number" />
	<input d.time type="time" />

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

	<p><span d.number></span>, <var d.number:json></var></p>

	<div d.:json></div>
</div>`;

magnus.add('d', DataController);

let allOutput: HTMLDivElement | null;
let controller: DataController;
let numberJsonOutput: HTMLElement | null;
let numberRawOutput: HTMLSpanElement | null;

afterAll(() => {
	document.body.innerHTML = '';
});

test('data attribute', () =>
	new Promise<void>(done => {
		setTimeout(() => {
			expect(controller.data).toEqual({
				array: [1, 2, 3],
				check: true,
				date: '1992-01-02',
				datetime: '1992-01-02T12:34',
				number: 123,
				object: {key: 'value'},
				radio: 'alpha',
				select: 1,
				text: 'Hello, world!',
				time: '12:34:56',
			});

			expect(numberJsonOutput?.textContent).toBe('123');
			expect(numberRawOutput?.textContent).toBe('123');
			expect(allOutput?.textContent).toBe(JSON.stringify(controller.data));

			controller.data.array = [4, 5, 6];
			controller.data.check = false;
			controller.data.date = '2000-01-01';
			controller.data.datetime = '2000-01-01T00:00';
			controller.data.number = 123;
			controller.data.object = {key: 'new value'};
			controller.data.radio = 'omega';
			controller.data.select = 2;
			controller.data.text = 'Goodbye, world!';
			controller.data.time = '23:59:59';
		}, 125);

		setTimeout(() => {
			expect(controller.data).toEqual({
				array: [4, 5, 6],
				check: false,
				date: '2000-01-01',
				datetime: '2000-01-01T00:00',
				number: 123,
				object: {key: 'new value'},
				radio: 'omega',
				select: 2,
				text: 'Goodbye, world!',
				time: '23:59:59',
			});

			expect(numberJsonOutput?.textContent).toBe('123');
			expect(numberRawOutput?.textContent).toBe('123');
			expect(allOutput?.textContent).toBe(JSON.stringify(controller.data));

			controller.data = {
				array: [7, 8, 9],
				check: true,
				date: '1900-01-01',
				datetime: '1900-01-01T09:15',
				number: 456,
				object: {key: 'another value'},
				radio: 'alpha',
				select: 0,
				text: 'Hello, world!',
				time: '09:15:00',
			};
		}, 250);

		setTimeout(() => {
			expect(controller.data).toEqual({
				array: [7, 8, 9],
				check: true,
				date: '1900-01-01',
				datetime: '1900-01-01T09:15',
				number: 456,
				object: {key: 'another value'},
				radio: 'alpha',
				select: 0,
				text: 'Hello, world!',
				time: '09:15:00',
			});

			expect(numberJsonOutput?.textContent).toBe('456');
			expect(numberRawOutput?.textContent).toBe('456');
			expect(allOutput?.textContent).toBe(JSON.stringify(controller.data));

			controller.data = {
				check: 123,
				date: {},
				ignored: null,
				number: 789,
				state: 0,
				text: 'Spring cleaning :)',
			} as never;

			controller.element.setAttribute('d-array', '123');
			controller.element.setAttribute('d-object', 'true');
		}, 375);

		setTimeout(() => {
			expect(controller.data).toEqual({
				array: [],
				check: false,
				number: 789,
				object: {},
				select: 0,
				state: 0,
				text: 'Spring cleaning :)',
			});

			expect(numberJsonOutput?.textContent).toBe('789');
			expect(numberRawOutput?.textContent).toBe('789');
			expect(allOutput?.textContent).toBe(JSON.stringify(controller.data));

			controller.data.number = undefined as never;

			controller.element.setAttribute('d-array', 'hello');
			controller.element.setAttribute('d-object', 'world');
		}, 500);

		setTimeout(() => {
			expect(controller.data).toEqual({
				array: [],
				check: false,
				object: {},
				select: 0,
				state: 0,
				text: 'Spring cleaning :)',
			});

			expect(numberJsonOutput?.textContent).toBe('');
			expect(numberRawOutput?.textContent).toBe('');
			expect(allOutput?.textContent).toBe(JSON.stringify(controller.data));

			controller.data.array = undefined as never;
			controller.data.object = undefined as never;

			controller.element.setAttribute('d-check', 'true');
			controller.element.setAttribute('d-text', 'Hello, again!');
		}, 1125);

		setTimeout(() => {
			expect(controller.data).toEqual({
				array: [],
				check: true,
				object: {},
				select: 0,
				state: 0,
				text: 'Hello, again!',
			});

			expect(numberJsonOutput?.textContent).toBe('');
			expect(numberRawOutput?.textContent).toBe('');
			expect(allOutput?.textContent).toBe(JSON.stringify(controller.data));

			controller.element.setAttribute('d-check', '');
			controller.element.setAttribute('d-text', 'Hello, again!');
		}, 1250);

		setTimeout(() => {
			expect(controller.data).toEqual({
				array: [],
				check: false,
				object: {},
				select: 0,
				state: 0,
				text: 'Hello, again!',
			});

			expect(numberJsonOutput?.textContent).toBe('');
			expect(numberRawOutput?.textContent).toBe('');
			expect(allOutput?.textContent).toBe(JSON.stringify(controller.data));

			controller.data = null;
		}, 1375);

		setTimeout(() => {
			expect(controller.data).toEqual({
				check: false,
				select: 0,
				text: '',
			});

			expect(numberJsonOutput?.textContent).toBe('');
			expect(numberRawOutput?.textContent).toBe('');
			expect(allOutput?.textContent).toBe(JSON.stringify(controller.data));

			done();
		}, 1500);
	}));
