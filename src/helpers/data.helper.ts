import {getNormalizedHex, isHexColor} from '@oscarpalmer/atoms/color';
import {isArrayOrPlainObject, isPlainObject} from '@oscarpalmer/atoms/is';
import type {ArrayOrPlainObject, GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {parse} from '@oscarpalmer/atoms/string';
import {MINUTE} from '@oscarpalmer/datum/constants';
import {getDate} from '@oscarpalmer/datum/get';
import {EXPRESSION_FALSE, EXPRESSION_TIME, EXPRESSION_TRUE} from '../constants';
import type {Context} from '../controller/context';
import type {DataType, DataTypes} from '../models';

export function getDataTypes(input: unknown): DataTypes {
	const types: DataTypes = {};

	if (!isPlainObject(input)) {
		return types;
	}

	const keys = Object.keys(input);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = input[key];

		if (dataTypes.has(value as never)) {
			types[key] = value as DataType;
		}
	}

	return types;
}

export function getDataValue(type: DataType, value: unknown): unknown {
	return type in transformers ? (transformers[type] as GenericCallback)(value, type) : value;
}

function getBoolean(value: unknown): boolean | undefined {
	if (typeof value === 'boolean') {
		return value;
	}

	if (typeof value === 'number') {
		return value === 0 ? false : value === 1 ? true : undefined;
	}

	if (typeof value !== 'string') {
		return;
	}

	if (EXPRESSION_TRUE.test(value)) {
		return true;
	}

	return EXPRESSION_FALSE.test(value) ? false : undefined;
}

function getColorValue(value: unknown): string | undefined {
	if (isHexColor(value)) {
		return `#${getNormalizedHex(value)}`;
	}
}

function getDateValue(value: unknown, type: DataType): string | undefined {
	const date = getDate(value);

	if (date == null) {
		return;
	}

	timezoneModifier ??= date.getTimezoneOffset() * MINUTE;

	return new Date(date.valueOf() - timezoneModifier)
		.toISOString()
		.slice(0, type === 'date' ? 10 : 16);
}

function getNumberValue(value: unknown): number | undefined {
	const asNumber = getNumber(value);

	return Number.isNaN(asNumber) ? undefined : asNumber;
}

function getObjectValue(value: unknown, type: DataType): ArrayOrPlainObject | undefined {
	const array = type === 'array';
	const actual = typeof value === 'string' ? parse(value) : value;

	if (array) {
		return Array.isArray(actual) ? actual : [];
	}

	return isPlainObject(actual) ? actual : {};
}

function getTime(value: unknown): string | undefined {
	if (value instanceof Date) {
		return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
	}

	if (typeof value === 'number') {
		return value >= 0 && value <= 23 ? `${pad(value)}:00:00` : undefined;
	}

	return parseTime(value);
}

function pad(value?: number | string): string {
	return String(value ?? '').padStart(2, '0');
}

function parseTime(value: unknown): string | undefined {
	if (typeof value !== 'string') {
		return;
	}

	const [_, hour, minutes, seconds] = EXPRESSION_TIME.exec(value) ?? [];

	if (hour != null) {
		return `${pad(hour)}:${pad(minutes)}:${pad(seconds)}`;
	}
}

export function replaceData(context: Context, value: unknown): void {
	const previous = Object.keys(context.data.value);
	const next = isArrayOrPlainObject(value) ? Object.keys(value) : [];

	for (const key of previous) {
		if (value == null || !next.includes(key)) {
			delete context.data.value[key];
		} else {
			context.data.value[key] = (value as PlainObject)[key];
		}
	}

	for (const key of next) {
		if (!previous.includes(key)) {
			const val = (value as PlainObject)[key];

			if (val != null) {
				context.data.value[key] = val;
			}
		}
	}
}

//

const dataTypes = new Set<DataType>([
	'array',
	'boolean',
	'color',
	'date',
	'datetime',
	'number',
	'object',
	'string',
	'time',
]);

const transformers: Partial<Record<DataType, (value: unknown, type: DataType) => unknown>> = {
	array: getObjectValue,
	boolean: getBoolean,
	color: getColorValue,
	date: getDateValue,
	datetime: getDateValue,
	number: getNumberValue,
	object: getObjectValue,
	time: getTime,
};

let timezoneModifier: number;
