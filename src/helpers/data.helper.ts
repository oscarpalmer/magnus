import {getNormalizedHex, isHexColor} from '@oscarpalmer/atoms/color';
import {isArrayOrPlainObject, isPlainObject} from '@oscarpalmer/atoms/is';
import type {ArrayOrPlainObject, PlainObject} from '@oscarpalmer/atoms/models';
import {getNumber} from '@oscarpalmer/atoms/number';
import {parse} from '@oscarpalmer/atoms/string';
import {getDate} from '@oscarpalmer/datum/get';
import {EXPRESSION_FALSE, EXPRESSION_TIME, EXPRESSION_TRUE} from '../constants';
import type {Context} from '../controller/context';
import type {ControllerDataType} from '../models';

export function getDataValue(type: ControllerDataType, value: unknown): unknown {
	if (type == null) {
		return value;
	}

	switch (type) {
		case 'array':
		case 'object':
			return getObject(value, type === 'array');

		case 'boolean':
			return getBoolean(value);

		case 'color':
			return isHexColor(value) ? `#${getNormalizedHex(value)}` : undefined;

		case 'date':
		case 'datetime':
			return getDateValue(value, type === 'datetime');

		case 'number':
			return getNumberValue(value);

		case 'time':
			return getTime(value);

		default:
			return value;
	}
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

function getDateValue(value: unknown, datetime: boolean): string | undefined {
	let date = getDate(value);

	if (date == null) {
		if (typeof value !== 'string') {
			return;
		}

		const parsed = Date.parse(value);

		if (!Number.isNaN(parsed)) {
			date = new Date(parsed);
		}
	}

	if (date == null) {
		return;
	}

	formatter ??= new Intl.DateTimeFormat('sv-SE');

	let suffix = '';

	if (datetime) {
		suffix = `T${getTime(date)}`;
	}

	return `${formatter.format(date)}${suffix}`;
}

function getNumberValue(value: unknown): number | undefined {
	const asNumber = getNumber(value);

	return Number.isNaN(asNumber) ? undefined : asNumber;
}

function getObject(value: unknown, array: boolean): ArrayOrPlainObject | undefined {
	const obj = typeof value === 'string' ? parse(value) : value;

	if (array) {
		return Array.isArray(obj) ? obj : [];
	}

	return isPlainObject(obj) ? obj : {};
}

function getTime(value: unknown): string | undefined {
	if (value instanceof Date) {
		return `${padPart(String(value.getHours()))}:${padPart(String(value.getMinutes()))}:${padPart(String(value.getSeconds()))}`;
	}

	if (typeof value === 'number') {
		return value >= 0 && value <= 23 ? `${padPart(String(value))}:00` : undefined;
	}

	if (typeof value !== 'string') {
		return;
	}

	const [_, hour, minutes, seconds] = EXPRESSION_TIME.exec(value) ?? [];

	if (hour != null) {
		return `${padPart(hour)}:${padPart(minutes)}:${padPart(seconds)}`;
	}
}

function padPart(value: string | undefined): string {
	return value == null ? '00' : value.padStart(2, '0');
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

let formatter: Intl.DateTimeFormat;
