import {parse} from '@oscarpalmer/atoms/string';
import type {Context} from '../../controller/context';

export function handleDataAttribute(
	context: Context,
	name: string,
	value: string,
): void {
	context.data.value[name] = parse(value) ?? value;
}
