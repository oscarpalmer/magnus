import {afterAll, expect, test, vi} from 'vitest';
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

		allOutput = this.targets.findAll('div');
		numberOutput = this.targets.findAll('var');
	}
}

function prettyJson(data: unknown): string {
	return JSON.stringify(data, null, 4);
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
	<input input:d.check type="checkbox" />
	<input input:d.date type="date" />
	<input input:d.datetime type="datetime-local" />
	<input input:d.number type="number" />
	<input input:d.time type="time" />

	<fieldset>
		<legend>Radio</legend>
		<input input:d.radio name="radio" type="radio" value="alpha" />
		<input input:d.radio name="radio" type="radio" value="omega" />
	</fieldset>

	<select input:d.select>
		<option value="0">Zero</option>
		<option value="1">One</option>
		<option value="2">Two</option>
	</select>

	<textarea output:d.text></textarea>

	<p><var output:d.number></var>, <var output:d.number:raw></var>, <var output:d.number:pretty></var></p>

	<div output:d.:raw></div>
	<div output:d.:pretty></div>
</div>`;

document.body.style.tabSize = '4';

magnus.add('d', DataController);

let allOutput: HTMLDivElement[];
let controller: DataController;
let numberOutput: HTMLElement[];

afterAll(() => {
	document.body.innerHTML = '';
});

test('data attribute', async () => {
	await vi.waitFor(() => {
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

		expect(numberOutput[0]?.textContent).toBe('123');
		expect(numberOutput[1]?.textContent).toBe('123');
		expect(numberOutput[2]?.textContent).toBe('123');

		expect(allOutput[0]?.textContent).toBe(JSON.stringify(controller.data));
		expect(allOutput[1]?.textContent).toBe(prettyJson(controller.data));
	});

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

	await vi.waitFor(() => {
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

		expect(numberOutput[0]?.textContent).toBe('123');
		expect(numberOutput[1]?.textContent).toBe('123');
		expect(numberOutput[2]?.textContent).toBe('123');

		expect(allOutput[0]?.textContent).toBe(JSON.stringify(controller.data));
		expect(allOutput[1]?.textContent).toBe(prettyJson(controller.data));
	});

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

	await vi.waitFor(() => {
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

		expect(numberOutput[0]?.textContent).toBe('456');
		expect(numberOutput[1]?.textContent).toBe('456');
		expect(numberOutput[2]?.textContent).toBe('456');

		expect(allOutput[0]?.textContent).toBe(JSON.stringify(controller.data));
		expect(allOutput[1]?.textContent).toBe(prettyJson(controller.data));
	});

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

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			array: [],
			check: false,
			number: 789,
			object: {},
			select: 0,
			state: 0,
			text: 'Spring cleaning :)',
		});

		expect(numberOutput[0]?.textContent).toBe('789');
		expect(numberOutput[1]?.textContent).toBe('789');
		expect(numberOutput[2]?.textContent).toBe('789');

		expect(allOutput[0]?.textContent).toBe(JSON.stringify(controller.data));
		expect(allOutput[1]?.textContent).toBe(prettyJson(controller.data));
	});

	controller.data.number = undefined as never;

	controller.element.setAttribute('d-array', 'hello');
	controller.element.setAttribute('d-object', 'world');

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			array: [],
			check: false,
			object: {},
			select: 0,
			state: 0,
			text: 'Spring cleaning :)',
		});

		expect(numberOutput[0]?.textContent).toBe('');
		expect(numberOutput[1]?.textContent).toBe('');
		expect(numberOutput[2]?.textContent).toBe('');

		expect(allOutput[0]?.textContent).toBe(JSON.stringify(controller.data));
		expect(allOutput[1]?.textContent).toBe(prettyJson(controller.data));
	});

	controller.data.array = undefined as never;
	controller.data.object = undefined as never;

	controller.element.setAttribute('d-check', 'true');
	controller.element.setAttribute('d-text', 'Hello, again!');

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			array: [],
			check: true,
			object: {},
			select: 0,
			state: 0,
			text: 'Hello, again!',
		});

		expect(numberOutput[0]?.textContent).toBe('');
		expect(numberOutput[1]?.textContent).toBe('');
		expect(numberOutput[2]?.textContent).toBe('');

		expect(allOutput[0]?.textContent).toBe(JSON.stringify(controller.data));
		expect(allOutput[1]?.textContent).toBe(prettyJson(controller.data));
	});

	controller.element.setAttribute('d-check', '');
	controller.element.setAttribute('d-text', 'Hello, again!');

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			array: [],
			check: false,
			object: {},
			select: 0,
			state: 0,
			text: 'Hello, again!',
		});

		expect(numberOutput[0]?.textContent).toBe('');
		expect(numberOutput[1]?.textContent).toBe('');
		expect(numberOutput[2]?.textContent).toBe('');

		expect(allOutput[0]?.textContent).toBe(JSON.stringify(controller.data));
		expect(allOutput[1]?.textContent).toBe(prettyJson(controller.data));
	});

	controller.data = null;

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			check: false,
			select: 0,
		});

		expect(numberOutput[0]?.textContent).toBe('');
		expect(numberOutput[1]?.textContent).toBe('');
		expect(numberOutput[2]?.textContent).toBe('');

		expect(allOutput[0]?.textContent).toBe(JSON.stringify(controller.data));
		expect(allOutput[1]?.textContent).toBe(prettyJson(controller.data));
	});
});
