/** biome-ignore-all lint/style/noMagicNumbers: Testing */
import {afterAll, expect, test} from 'vitest';
import {Controller, magnus} from '../src';

type Data<Value> = Record<Key, Value>;

type Key = 'first' | 'fourth' | 'second' | 'third';

type Values = {
	boolean: boolean;
	nested: {value: string};
	number: number;
	select: number;
	text: string;
	textarea: string;
};

class InputOutputController extends Controller<Values> {
	static readonly types = {
		boolean: 'boolean',
		nested: 'object',
		number: 'number',
		select: 'number',
		text: 'string',
		textarea: 'string',
	} as never;

	connect(): void {
		let checkbox: HTMLInputElement;
		let number: HTMLInputElement;
		let outputs: HTMLLIElement[];
		let pre: HTMLPreElement;
		let select: HTMLSelectElement;
		let text: HTMLInputElement;
		let textareas: HTMLTextAreaElement[];

		setTimeout(() => {
			checkbox = this.targets.find<HTMLInputElement>('input[type="checkbox"]')!;

			number = this.targets.find<HTMLInputElement>('input[type="number"]')!;

			outputs = this.targets.findAll<HTMLLIElement>('li');
			pre = this.targets.find<HTMLPreElement>('pre')!;
			select = this.targets.find<HTMLSelectElement>('select')!;
			text = this.targets.find<HTMLInputElement>('input[type="text"]')!;
			textareas = this.targets.findAll<HTMLTextAreaElement>('textarea');
		}, 125);

		setTimeout(() => {
			setValues('first', this, outputs, pre, select);

			this.data.boolean = false;
			this.data.nested = {value: 'foo'};
			this.data.number = 99;
			this.data.select = 1;
			this.data.text = 'foo bar';
			this.data.textarea = 'foo baz';
		}, 250);

		setTimeout(() => {
			setValues('second', this, outputs, pre, select);

			if (checkbox != null) {
				checkbox.checked = true;
			}

			if (number != null) {
				number.value = '123';
			}

			if (select != null) {
				select.value = '3';
			}

			if (text != null) {
				text.value = 'Magnus!';
			}

			textareas[0].focus();

			textareas[0].value = '!sungaM';
			textareas[3].value = '{"value": "bar"}';

			checkbox.dispatchEvent(new Event('change', {bubbles: true}));
			number.dispatchEvent(new Event('input', {bubbles: true}));
			select.dispatchEvent(new Event('change', {bubbles: true}));
			text.dispatchEvent(new Event('input', {bubbles: true}));
			textareas[0].dispatchEvent(new Event('input', {bubbles: true}));
			textareas[3].dispatchEvent(new Event('input', {bubbles: true}));
		}, 375);

		setTimeout(() => {
			setValues('third', this, outputs, pre, select);

			textareas[2].value = `{
	"boolean": false,
	"nested": {
		"value": "foo bar"
	},
	"number": 99,
	"select": 1,
	"text": "Hello, world!",
	"textarea": "Hello, universe!"
}`;

			textareas[2].dispatchEvent(new Event('input', {bubbles: true}));
		}, 500);

		setTimeout(() => {
			setValues('fourth', this, outputs, pre, select);
		}, 625);
	}
}

function setValues(
	key: Key,
	controller: InputOutputController,
	outputs: HTMLLIElement[],
	pre: HTMLPreElement,
	select: HTMLSelectElement,
): void {
	input[key] = {...controller.data};
	json[key] = pre.textContent;
	option[key] = select.options[select.selectedIndex].textContent;
	output[key] = outputs.map(output => output.textContent).join('; ');
}

const input: Data<Values> = {
	first: null as never,
	second: null as never,
	third: null as never,
	fourth: null as never,
};

const json: Data<string> = {
	first: '',
	second: '',
	third: '',
	fourth: '',
};

const option: Data<string> = {
	first: '',
	second: '',
	third: '',
	fourth: '',
};

const output: Data<string> = {
	first: '',
	second: '',
	third: '',
	fourth: '',
};

document.body.innerHTML = `<div
	:io-test
	io-test-boolean="true"
	io-test-nested='{"value": ""}'
	io-test-number="42"
	io-test-select="2"
	io-test-text="Hello, world!"
	io-test-textarea="Hello, universe!"
>
	<input type="checkbox" io-test.boolean />
	<input type="number" io-test.number />
	<input type="text" io-test.text />
	<input type="submit" io-test.text />

	<select io-test.select>
		<option value="1">A</option>
		<option value="2">B</option>
		<option value="3">C</option>
	</select>

	<textarea io-test.textarea></textarea>
	<textarea io-test.textarea></textarea>

	<div io-test.ignored"></div>
	<div io-test.invalid!></div>

	<ul>
		<li io-test.boolean></li>
		<li io-test.number></li>
		<li io-test.select></li>
		<li io-test.text></li>
		<li io-test.textarea></li>
	</ul>

	<textarea io-test.:json></textarea>
	<textarea io-test.nested:json></textarea>

	<pre io-test.:json></pre>
</div>`;

magnus.add('io-test', InputOutputController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('input/output attribute', () =>
	new Promise<void>(done => {
		setTimeout(() => {
			expect(input.first).toEqual({
				boolean: true,
				nested: {value: ''},
				number: 42,
				select: 2,
				text: 'Hello, world!',
				textarea: 'Hello, universe!',
			});

			expect(input.second).toEqual({
				boolean: false,
				nested: {value: 'foo'},
				number: 99,
				select: 1,
				text: 'foo bar',
				textarea: 'foo baz',
			});

			expect(input.third).toEqual({
				boolean: true,
				nested: {value: 'bar'},
				number: 123,
				select: 3,
				text: 'Magnus!',
				textarea: '!sungaM',
			});

			expect(input.fourth).toEqual({
				boolean: false,
				nested: {value: 'foo bar'},
				number: 99,
				select: 1,
				text: 'Hello, world!',
				textarea: 'Hello, universe!',
			});

			expect(json.first).toBe(
				'{"boolean":true,"nested":{"value":""},"number":42,"select":2,"text":"Hello, world!","textarea":"Hello, universe!"}',
			);

			expect(json.second).toBe(
				'{"boolean":false,"nested":{"value":"foo"},"number":99,"select":1,"text":"foo bar","textarea":"foo baz"}',
			);

			expect(json.third).toBe(
				'{"boolean":true,"nested":{"value":"bar"},"number":123,"select":3,"text":"Magnus!","textarea":"!sungaM"}',
			);

			expect(json.fourth).toBe(
				'{"boolean":false,"nested":{"value":"foo bar"},"number":99,"select":1,"text":"Hello, world!","textarea":"Hello, universe!"}',
			);

			expect(option.first).toBe('B');
			expect(option.second).toBe('A');
			expect(option.third).toBe('C');
			expect(option.fourth).toBe('A');

			expect(output.first).toBe('true; 42; 2; Hello, world!; Hello, universe!');
			expect(output.second).toBe('false; 99; 1; foo bar; foo baz');
			expect(output.third).toBe('true; 123; 3; Magnus!; !sungaM');

			expect(output.fourth).toBe('false; 99; 1; Hello, world!; Hello, universe!');

			done();
		}, 1000);
	}));
