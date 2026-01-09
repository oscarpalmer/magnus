import {expect, test} from 'vitest';
import {getDataValue} from '../src/helpers/data.helper';

test('array', () => {
	const values = [
		[],
		[1, 2, 3],
		'["a", "b", "c"]',
		'not an array',
		{},
		null,
		undefined,
		123,
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const value = getDataValue('array', values[index]);

		if (index < 3) {
			expect(Array.isArray(value)).toBe(true);
		} else {
			expect(value).toEqual([]);
		}
	}
});

test('boolean', () => {
	const values = [
		false,
		true,
		0,
		1,
		'false',
		'true',
		'0',
		'1',
		123,
		'hello',
		null,
		undefined,
		{},
		[],
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const value = getDataValue('boolean', values[index]);

		expect(value).toBeTypeOf(index < 8 ? 'boolean' : 'undefined');
	}
});

test('color', () => {
	const values = [
		'fff',
		'000',
		'fffa',
		'0000',
		'#ffffff',
		'#000000',
		'#ffffff00',
		'#000000ff',
		'not a color',
		123,
		{},
		[],
		null,
		undefined,
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		expect(getDataValue('color', values[index])).toBeTypeOf(index < 8 ? 'string' : 'undefined');
	}
});

test('date', () => {
	const values = [
		new Date(),
		new Date().toISOString(),
		1234567890,
		'1992-01-02',
		Number.MIN_SAFE_INTEGER,
		Number.MAX_SAFE_INTEGER,
		'hello',
		{},
		[],
		null,
		undefined,
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		expect(getDataValue('date', values[index])).toBeTypeOf(index < 4 ? 'string' : 'undefined');
	}
});

test('datetime', () => {
	const values = [
		new Date(),
		new Date().toISOString(),
		1234567890,
		'1992',
		'1992-1',
		'1992-01',
		'1992-01-2',
		'1992-01-02',
		'1992-01-02T1',
		'1992-01-02T01',
		'1992-01-02T01:2',
		'1992-01-02T01:02',
		Number.MIN_SAFE_INTEGER,
		Number.MAX_SAFE_INTEGER,
		'hello',
		{},
		[],
		null,
		undefined,
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		expect(getDataValue('datetime', values[index])).toBeTypeOf(index < 12 ? 'string' : 'undefined');
	}
});

test('no type & unknown type', () => {
	const values = [
		false,
		true,
		0,
		1,
		'false',
		'true',
		'0',
		'1',
		new Date(),
		new Date().toISOString(),
		[],
		[1, 2, 3],
		'["a", "b", "c"]',
		{},
		{key: 'value'},
		'{"a":1,"b":2}',
		null,
		undefined,
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const none = getDataValue(undefined as never, values[index]);
		const unknown = getDataValue('unknown' as never, values[index]);

		expect(none).toBe(values[index]);
		expect(unknown).toBe(values[index]);
	}
});

test('number', () => {
	const values = [
		123,
		-123.456,
		'789',
		'-789.012',
		Number.POSITIVE_INFINITY,
		'hello',
		Number.NaN,
		{},
		[],
		null,
		undefined,
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const value = getDataValue('number', values[index]);

		if (index < 5) {
			expect(value).toBeTypeOf('number');
		} else {
			expect(value).toBeUndefined();
		}
	}
});

test('object', () => {
	const values = [
		{},
		{key: 'value'},
		'{"a":1,"b":2}',
		'not an object',
		[],
		null,
		undefined,
		123,
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const value = getDataValue('object', values[index]);

		if (index < 3) {
			expect(typeof value === 'object' && !Array.isArray(value) && value !== null).toBe(true);
		} else {
			expect(value).toEqual({});
		}
	}
});

test('time', () => {
	const values = [
		0,
		12,
		23,
		'00:00',
		'9:5',
		'12:34:56',
		'23:59:59',
		new Date(),
		'24:00',
		'12:60',
		-1,
		24,
		'hello',
		{},
		[],
		null,
		undefined,
		() => {},
		new Map(),
		new Set(),
		document.createElement('div'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		expect(getDataValue('time', values[index])).toBeTypeOf(index < 8 ? 'string' : 'undefined');
	}
});
