import {afterAll, expect, test} from 'vitest';
import {magnus, Controller} from '../src';

type Data<Value> = Record<Key, Value>;

type Key = 'first' | 'fourth' | 'second' | 'third';

type Values = {
	boolean: boolean;
	number: number;
	select: number;
	text: string;
	textarea: string;
};

class InputOutputController extends Controller<Values> {
	connect() {
		setTimeout(() => {
			const checkbox = this.targets.find<HTMLInputElement>(
				'input[type="checkbox"]',
			);

			const number = this.targets.find<HTMLInputElement>(
				'input[type="number"]',
			);

			const outputs = this.targets.findAll<HTMLLIElement>('li');

			const pre = this.targets.find<HTMLPreElement>('pre');

			const select = this.targets.find<HTMLSelectElement>('select');

			const text = this.targets.find<HTMLInputElement>('input[type="text"]');

			const textareas = this.targets.findAll<HTMLTextAreaElement>('textarea');

			setTimeout(() => {
				setValues('first', this, outputs, pre, select);

				this.data.boolean = false;
				this.data.number = 99;
				this.data.select = 1;
				this.data.text = 'foo bar';
				this.data.textarea = 'foo baz';

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

					textareas[0].value = '!sungaM';

					checkbox?.dispatchEvent(new Event('change'));
					number?.dispatchEvent(new Event('input'));
					select?.dispatchEvent(new Event('change'));
					text?.dispatchEvent(new Event('input'));
					textareas[0].dispatchEvent(new Event('input'));

					setTimeout(() => {
						setValues('third', this, outputs, pre, select);

						textareas[1].value = `{
	"boolean": false,
	"number": 99,
	"select": 1,
	"text": "Hello, world!",
	"textarea": "Hello, universe!"
}`;

						textareas[1].dispatchEvent(new Event('input'));

						setTimeout(() => {
							setValues('fourth', this, outputs, pre, select);
						}, 25);
					}, 125);
				}, 125);
			}, 125);
		}, 125);
	}
}

function setValues(
	key: Key,
	controller: InputOutputController,
	outputs: HTMLLIElement[],
	pre: HTMLPreElement | null,
	select: HTMLSelectElement | null,
) {
	input[key] = {...controller.data};
	json[key] = pre?.textContent ?? '';
	option[key] = select?.selectedOptions[0].textContent ?? '';
	output[key] = outputs.map(output => output.textContent).join('; ');
}

const input: Data<Values> = {
	first: {
		boolean: false,
		number: -1,
		select: -1,
		text: '',
		textarea: '',
	},
	second: {
		boolean: true,
		number: -1,
		select: -1,
		text: '',
		textarea: '',
	},
	third: {
		boolean: false,
		number: -1,
		select: -1,
		text: '',
		textarea: '',
	},
	fourth: {
		boolean: true,
		number: -1,
		select: -1,
		text: '',
		textarea: '',
	},
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
	io-test-number="42"
	io-test-select="2"
	io-test-text="Hello, world!"
	io-test-textarea="Hello, universe!"
>
	<input type="checkbox" io-test.boolean />
	<input type="number" io-test.number />
	<input type="text" io-test.text />

	<select io-test.select>
		<option value="1">A</option>
		<option value="2">B</option>
		<option value="3">C</option>
	</select>

	<textarea io-test.textarea"></textarea>

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
	<textarea io-test></textarea>

	<pre io-test.:json></pre>
</div>`;

magnus.add('io-test', InputOutputController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('input/output attribute', () =>
	new Promise<void>(done => {
		setTimeout(() => {
			/* expect(input.first).toEqual({
				boolean: true,
				number: 42,
				select: 2,
				text: 'Hello, world!',
				textarea: 'Hello, universe!',
			});

			expect(input.second).toEqual({
				boolean: false,
				number: 99,
				select: 1,
				text: 'foo bar',
				textarea: 'foo baz',
			});

			expect(input.third).toEqual({
				boolean: true,
				number: 123,
				select: 3,
				text: 'Magnus!',
				textarea: '!sungaM',
			});

			expect(json.first).toBe(
				'{"boolean":true,"number":42,"select":2,"text":"Hello, world!","textarea":"Hello, universe!"}',
			);

			expect(json.second).toBe(
				'{"boolean":false,"number":99,"select":1,"text":"foo bar","textarea":"foo baz"}',
			);

			expect(json.third).toBe(
				'{"boolean":true,"number":123,"select":3,"text":"Magnus!","textarea":"!sungaM"}',
			);

			expect(option.first).toBe('B');
			expect(option.second).toBe('A');
			expect(option.third).toBe('C');

			expect(output.first).toBe('true; 42; 2; Hello, world!; Hello, universe!');
			expect(output.second).toBe('false; 99; 1; foo bar; foo baz');
			expect(output.third).toBe('true; 123; 3; Magnus!; !sungaM'); */

			done();
		}, 250);
	}));
