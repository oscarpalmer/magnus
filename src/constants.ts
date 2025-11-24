/** biome-ignore-all lint/style/useNamingConvention: Matching HTML-tags, so okay to override */

export const DEBOUNCE_DELAY = 25;

//

/**
 * - `::(controller.)(identifier.)action(:options)`
 * - `[, name, id?, value, options?]`
 */
export const EXPRESSION_ACTION_ATTRIBUTE_NAME =
	/^::(?:([\w-]+)\.(?:([\w-]+)\.)?)?([\w-]+)(?::([a-z:]+))?$/i;

/**
 * - `controller(.identifier)@action(:options)`
 * - `[, name, id?, value, options?]`
 */
export const EXPRESSION_ACTION_ATTRIBUTE_VALUE =
	/^([\w-]+)(?:\.([\w-]+))?@([\w-]+)(?::([a-z:]+))?$/i;

/**
 * - `:controller`
 * - `[, name]`
 */
export const EXPRESSION_CONTROLLER_ATTRIBUTE_FULL = /^:([\w-]+)$/;

export const EXPRESSION_CONTROLLER_ATTRIBUTE_PREFIX = /^:/;

/**
 * `controller-data-attribute`
 */
export const EXPRESSION_DATA_ATTRIBUTE = /^\w+-[\w-]+$/;

/**
 * Pattern to match global event origin
 */
export const EXPRESSION_DOCUMENT = /^document$/i;

/**
 * - `controller(.identifier).property(:json)`
 * - `[, name, id?, value]`
 */
export const EXPRESSION_IO_ATTRIBUTE_FULL =
	/^([\w-]+)(?:\.([\w-]+))?\.([\w-]*)(?::json)?$/;

export const EXPRESSION_IO_ATTRIBUTE_PREFIX = /^[\w-]+(?:\.[\w-]+)?\./;

export const EXPRESSION_JSON_SUFFIX = /:json$/;

/**
 * - `controller(.identifier):target`
 * - `[, name, id?, value]`
 */
export const EXPRESSION_TARGET_ATTRIBUTE_FULL =
	/^([\w-]+)(?:\.([\w-]+))?:([\w-]+)$/;

export const EXPRESSION_TARGET_ATTRIBUTE_PREFIX = /^[\w-]+(?:\.[\w-]+)?:/;

export const EXPRESSION_TRUE = /^true$/i;

export const EXPRESSION_WHITESPACE = /\s+/;

/**
 * Pattern to match global event origin
 */
export const EXPRESSION_WINDOW = /^window$/i;

//

/**
 * Input types that should trigger `change`, not `input`
 */
export const EVENT_CHANGE: Set<string> = new Set(['checkbox', 'radio']);

/**
 * Default events for element types
 */
export const EVENT_DEFAULTS: Record<string, string> = {
	A: 'click',
	BUTTON: 'click',
	DETAILS: 'toggle',
	FORM: 'submit',
	SELECT: 'change',
	TEXTAREA: 'input',
};

//

/**
 * Input types that should be ignored
 */
export const EVENT_IGNORED: Set<string> = new Set([
	'button',
	'image',
	'reset',
	'submit',
]);

/**
 * Input types that should be handled as `number`
 */
export const INPUT_NUMBER: Set<string> = new Set(['number', 'range']);

/**
 * Input types that should be parsed
 */
export const INPUT_PARSEABLE: Set<string> = new Set([
	'checkbox',
	'hidden',
	'radio',
]);
