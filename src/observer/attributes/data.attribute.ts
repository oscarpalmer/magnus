import type {Context} from '../../controller/context';

export function handleDataAttribute(
	context: Context,
	name: string,
	value: string,
): void {
	let data: unknown;

	try {
		data = JSON.parse(value);
	} catch (_) {
		data = value;
	}

	context.data.value[name] = data;
}
