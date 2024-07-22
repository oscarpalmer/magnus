type ParsedAttribute = {
	controller: string;
	identifier: string | null;
	name: string;
};

// ((external(#id)@)event->)controller(#id)@method(:options)
export const actionAttributePattern =
	/^(?:(?:((\w+)(?:#(\w+))?)@)?(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;

// controller(#id).target
const targetAttributePattern = /^(\w+)(?:#(\w+))?\.(\w+)$/i;

function parseActionAttribute(attribute: string): ParsedAttribute | undefined {
	const matches = actionAttributePattern.exec(attribute);

	if (matches == null) {
		return;
	}

	const [, , , , , controller, identifier, method] = matches;

	return {
		controller: controller == null ? identifier : controller,
		identifier: controller == null ? null : identifier,
		name: method,
	};
}

export function parseAttribute(
	type: 'action' | 'target',
	value: string,
): ParsedAttribute | undefined {
	return type === 'action'
		? parseActionAttribute(value)
		: parseTargetAttribute(value);
}

function parseTargetAttribute(attribute: string): ParsedAttribute | undefined {
	const matches = targetAttributePattern.exec(attribute);

	if (matches != null) {
		const [, controller, identifier, name] = matches;

		return {
			controller,
			identifier,
			name,
		};
	}
}