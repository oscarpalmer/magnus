import type {ParsedAttribute} from '../models';

// (event->)controller(#id)@method(:options)
export const actionAttributePattern =
	/^(?:(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;

// ((external(#id)@)event->)controller(#id)@method(:options)
export const extendedActionAttributePattern =
	/^(?:(?:(?:(\w+)(?:#(\w+))?)?@)?(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;

// controller(#id).target
const targetAttributePattern = /^(\w+)(?:#(\w+))?\.(\w+)$/i;

function parseActionAttribute(attribute: string): ParsedAttribute | undefined {
	const matches = extendedActionAttributePattern.exec(attribute);

	if (matches != null) {
		const [, , , , name, id, method] = matches;

		return {
			id: name == null ? undefined : id,
			name: name == null ? id : name,
			value: method,
		};
	}
}

export function parseAttribute(
		type: 'action' | 'input' | 'output' | 'target',
		value: string,
	): ParsedAttribute | undefined {
		return type === 'action'
			? parseActionAttribute(value)
			: parseTargetAttribute(value);
	}

function parseTargetAttribute(attribute: string): ParsedAttribute | undefined {
	const matches = targetAttributePattern.exec(attribute);

	if (matches != null) {
		const [, name, id, value] = matches;

		return {
			id,
			name,
			value,
		};
	}
}
