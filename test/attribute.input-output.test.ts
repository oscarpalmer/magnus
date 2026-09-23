import {afterAll, expect, test, vi} from 'vitest';
import {Controller, magnus} from '../src';

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
		controller = this;
	}
}

let controller: InputOutputController;

document.body.innerHTML = `<div
	:io-test
	io-test-boolean="true"
	io-test-nested='{"value": ""}'
	io-test-number="42"
	io-test-select="2"
	io-test-text="Hello, world!"
	io-test-textarea="Hello, universe!"
>
	<input type="checkbox" input:io-test.boolean />
	<input type="number" input:io-test.number />
	<input type="text" input:io-test.text />
	<input type="submit" input:io-test.text />

	<select input:io-test.select>
		<option value="1">A</option>
		<option value="2">B</option>
		<option value="3">C</option>
	</select>

	<textarea output:io-test.textarea></textarea>
	<textarea output:io-test.textarea></textarea>

	<div output:io-test.ignored"></div>
	<div output:io-test.invalid!></div>

	<ul>
		<li output:io-test.boolean></li>
		<li output:io-test.number></li>
		<li output:io-test.select></li>
		<li output:io-test.text></li>
		<li output:io-test.textarea></li>
	</ul>

	<textarea output:io-test.:raw></textarea>
	<textarea output:io-test.nested:raw></textarea>

	<pre output:io-test.:raw></pre>
</div>`;

magnus.add('io-test', InputOutputController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('input/output attribute', async () => {
	await vi.waitFor(() => {
		expect(controller).toBeInstanceOf(InputOutputController);
	});

	const checkbox = controller.targets.find<HTMLInputElement>('input[type="checkbox"]')!;
	const number = controller.targets.find<HTMLInputElement>('input[type="number"]')!;
	const outputs = controller.targets.findAll<HTMLLIElement>('li');
	const pre = controller.targets.find<HTMLPreElement>('pre')!;
	const select = controller.targets.find<HTMLSelectElement>('select')!;
	const text = controller.targets.find<HTMLInputElement>('input[type="text"]')!;
	const textareas = controller.targets.findAll<HTMLTextAreaElement>('textarea');

	function snapshot(): string {
		return `${outputs.map(output => output.textContent).join('; ')}\n${select.options[select.selectedIndex].textContent}\n${pre.textContent}`;
	}

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			boolean: true,
			nested: {value: ''},
			number: 42,
			select: 2,
			text: 'Hello, world!',
			textarea: 'Hello, universe!',
		});

		expect(snapshot()).toBe(
			'true; 42; 2; Hello, world!; Hello, universe!\nB\n{"boolean":true,"nested":{"value":""},"number":42,"select":2,"text":"Hello, world!","textarea":"Hello, universe!"}',
		);
	});

	controller.data.boolean = false;
	controller.data.nested = {value: 'foo'};
	controller.data.number = 99;
	controller.data.select = 1;
	controller.data.text = 'foo bar';
	controller.data.textarea = 'foo baz';

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			boolean: false,
			nested: {value: 'foo'},
			number: 99,
			select: 1,
			text: 'foo bar',
			textarea: 'foo baz',
		});

		expect(snapshot()).toBe(
			'false; 99; 1; foo bar; foo baz\nA\n{"boolean":false,"nested":{"value":"foo"},"number":99,"select":1,"text":"foo bar","textarea":"foo baz"}',
		);
	});

	checkbox.checked = true;
	number.value = '123';
	select.value = '3';
	text.value = 'Magnus!';

	textareas[0].focus();

	textareas[0].value = '!sungaM';
	textareas[3].value = '{"value": "bar"}';

	checkbox.dispatchEvent(new Event('change', {bubbles: true}));
	number.dispatchEvent(new Event('input', {bubbles: true}));
	select.dispatchEvent(new Event('change', {bubbles: true}));
	text.dispatchEvent(new Event('input', {bubbles: true}));
	textareas[0].dispatchEvent(new Event('input', {bubbles: true}));
	textareas[3].dispatchEvent(new Event('input', {bubbles: true}));

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			boolean: true,
			nested: {value: 'bar'},
			number: 123,
			select: 3,
			text: 'Magnus!',
			textarea: '!sungaM',
		});

		expect(snapshot()).toBe(
			'true; 123; 3; Magnus!; !sungaM\nC\n{"boolean":true,"nested":{"value":"bar"},"number":123,"select":3,"text":"Magnus!","textarea":"!sungaM"}',
		);
	});

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

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			boolean: false,
			nested: {value: 'foo bar'},
			number: 99,
			select: 1,
			text: 'Hello, world!',
			textarea: 'Hello, universe!',
		});

		expect(snapshot()).toBe(
			'false; 99; 1; Hello, world!; Hello, universe!\nA\n{"boolean":false,"nested":{"value":"foo bar"},"number":99,"select":1,"text":"Hello, world!","textarea":"Hello, universe!"}',
		);
	});
});
