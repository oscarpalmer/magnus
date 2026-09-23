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

	<textarea input:io-test.textarea></textarea>
	<textarea input:io-test.textarea></textarea>

	<textarea input:io-test.:raw></textarea>
	<textarea input:io-test.nested:raw></textarea>
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

	const [
		textareaOutputOne,
		textareaOutputTwo,
		textareaRaw,
		textareaNestedRaw,
		textareaInputOne,
		textareaInputTwo,
		textareaJsonInput,
		textareaNestedInput,
	] = textareas;

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

		expect(textareaOutputOne.value).toBe('Hello, universe!');
		expect(textareaOutputTwo.value).toBe('Hello, universe!');
		expect(textareaInputOne.value).toBe('Hello, universe!');
		expect(textareaInputTwo.value).toBe('Hello, universe!');
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

		expect(textareaOutputOne.value).toBe('foo baz');
		expect(textareaOutputTwo.value).toBe('foo baz');
		expect(textareaInputOne.value).toBe('foo baz');
		expect(textareaInputTwo.value).toBe('foo baz');
	});

	checkbox.checked = true;
	number.value = '123';
	select.value = '3';
	text.value = 'Magnus!';

	checkbox.dispatchEvent(new Event('change', {bubbles: true}));
	number.dispatchEvent(new Event('input', {bubbles: true}));
	select.dispatchEvent(new Event('change', {bubbles: true}));
	text.dispatchEvent(new Event('input', {bubbles: true}));

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			boolean: true,
			nested: {value: 'foo'},
			number: 123,
			select: 3,
			text: 'Magnus!',
			textarea: 'foo baz',
		});

		expect(snapshot()).toBe(
			'true; 123; 3; Magnus!; foo baz\nC\n{"boolean":true,"nested":{"value":"foo"},"number":123,"select":3,"text":"Magnus!","textarea":"foo baz"}',
		);
	});

	// outputs (plain, `:raw`, and `nested:raw`) never emit, even when edited directly
	textareaOutputOne.value = '!sungaM';
	textareaRaw.value = '{"boolean": false}';
	textareaNestedRaw.value = '{"value": "bar"}';

	textareaOutputOne.dispatchEvent(new Event('input', {bubbles: true}));
	textareaRaw.dispatchEvent(new Event('input', {bubbles: true}));
	textareaNestedRaw.dispatchEvent(new Event('input', {bubbles: true}));

	expect(controller.data).toEqual({
		boolean: true,
		nested: {value: 'foo'},
		number: 123,
		select: 3,
		text: 'Magnus!',
		textarea: 'foo baz',
	});

	// a subsequent data change still reaches the (never-emitting) outputs
	controller.data.textarea = 'restored';

	await vi.waitFor(() => {
		expect(textareaOutputOne.value).toBe('restored');
		expect(textareaOutputTwo.value).toBe('restored');
		expect(textareaInputOne.value).toBe('restored');
		expect(textareaInputTwo.value).toBe('restored');
	});

	// typing into one input reaches data and every other input/output for the same property
	textareaInputOne.value = 'typed by one';
	textareaInputOne.dispatchEvent(new Event('input', {bubbles: true}));

	await vi.waitFor(() => {
		expect(controller.data.textarea).toBe('typed by one');
		expect(textareaInputTwo.value).toBe('typed by one');
		expect(textareaOutputOne.value).toBe('typed by one');
		expect(textareaOutputTwo.value).toBe('typed by one');
	});

	// a focused input is skipped when the change came from elsewhere, so it isn't clobbered mid-edit
	let inputCount = 0;

	textareaInputOne.addEventListener('input', () => {
		inputCount += 1;
	});

	textareaInputOne.focus();

	controller.data.textarea = 'changed elsewhere';

	await vi.waitFor(() => {
		expect(textareaInputTwo.value).toBe('changed elsewhere');
		expect(textareaOutputOne.value).toBe('changed elsewhere');
		expect(textareaOutputTwo.value).toBe('changed elsewhere');
	});

	expect(textareaInputOne.value).toBe('typed by one');
	expect(inputCount).toBe(0);

	// once it's no longer focused, it catches up like everything else, dispatching normally
	textareaInputOne.blur();

	controller.data.textarea = 'changed after blur';

	await vi.waitFor(() => {
		expect(textareaInputOne.value).toBe('changed after blur');
	});

	expect(inputCount).toBe(1);

	// pasting a whole JSON object into a bound `input:` (never `output:`) replaces all data
	textareaJsonInput.value = JSON.stringify({
		boolean: false,
		nested: {value: 'replaced'},
		number: 7,
		select: 1,
		text: 'Replaced!',
		textarea: 'replaced too',
	});

	textareaJsonInput.dispatchEvent(new Event('input', {bubbles: true}));

	await vi.waitFor(() => {
		expect(controller.data).toEqual({
			boolean: false,
			nested: {value: 'replaced'},
			number: 7,
			select: 1,
			text: 'Replaced!',
			textarea: 'replaced too',
		});
	});

	// pasting raw JSON into a named+formatted `input:` sets just that property
	textareaNestedInput.value = '{"value": "named and formatted"}';
	textareaNestedInput.dispatchEvent(new Event('input', {bubbles: true}));

	await vi.waitFor(() => {
		expect(controller.data.nested).toEqual({value: 'named and formatted'});
	});
});
