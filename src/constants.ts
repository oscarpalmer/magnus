import type {DataFormat, DataType, ParsedAttributeType} from './models';

// #region Variables

export const EVENT_CHANGE: Set<string> = new Set(['checkbox', 'radio']);

export const EVENT_DEFAULTS: Record<string, string> = {
	A: 'click',
	BUTTON: 'click',
	DETAILS: 'toggle',
	FORM: 'submit',
	SELECT: 'change',
	TEXTAREA: 'input',
};

export const EVENT_IGNORED: Set<string> = new Set(['button', 'image', 'reset', 'submit']);

/**
 * - `on:(controller.)(identifier.)action(:options)`
 * - `[, name, id?, value, options?]`
 */
export const EXPRESSION_ACTION_ATTRIBUTE_NAME: RegExp =
	/^on:(?:([\w-]+)\.(?:([\w-]+)\.)?)?([\w-]+)(?::([a-z:]+))?$/i;

/**
 * - `controller(.identifier).action(:options)`
 * - `[, name, id?, value, options?]`
 */
export const EXPRESSION_ACTION_ATTRIBUTE_VALUE: RegExp =
	/^([\w-]+)(?:\.([\w-]+))?\.([\w-]+)(?::([a-z:]+))?$/i;

/**
 * - `:controller`
 * - `[, name]`
 */
export const EXPRESSION_CONTROLLER_ATTRIBUTE_FULL: RegExp = /^:([\w-]+)$/;

export const EXPRESSION_CONTROLLER_ATTRIBUTE_PREFIX: RegExp = /^:/;

/**
 * `controller-data-attribute`
 */
export const EXPRESSION_DATA_ATTRIBUTE: RegExp = /^\w+-[\w-]+$/;

export const EXPRESSION_DOCUMENT: RegExp = /^document$/i;

export const EXPRESSION_EVENT_ACTIVE: RegExp = /^a(ctive)$/i;

export const EXPRESSION_EVENT_CAPTURE: RegExp = /^c(|apture)$/i;

export const EXPRESSION_EVENT_ONCE: RegExp = /^o(nce)$/i;

export const EXPRESSION_FALSE: RegExp = /^(0|false)$/i;

/**
 * - `input:controller(.identifier).property(:pretty|raw)`
 * - `[, name, id?, property, json?]`
 */
export const EXPRESSION_INPUT_ATTRIBUTE: RegExp =
	/^input:([\w-]+)(?:\.([\w-]+))?\.([\w-]*)(?::(pretty|raw))?$/;

export const EXPRESSION_INVALID_METHOD: RegExp = /(^__|^(connect|constructor|disconnect)$)/i;

/**
 * - `output:controller(.identifier).property(:pretty|raw)`
 * - `[, name, id?, property, json?]`
 */
export const EXPRESSION_OUTPUT_ATTRIBUTE: RegExp =
	/^output:([\w-]+)(?:\.([\w-]+))?\.([\w-]*)(?::(pretty|raw))?$/;

/**
 * - `controller(.identifier):target`
 * - `[, name, id?, value]`
 */
export const EXPRESSION_TARGET_ATTRIBUTE_FULL: RegExp =
	/^target:([\w-]+)(?:\.([\w-]+))?\.([\w-]+)$/;

export const EXPRESSION_TIME: RegExp =
	/^([01]?\d|2[0-3])(?::([0-5]?\d)(?::([0-5]?\d)(?:\.\d{1,3})?)?)?$/;

export const EXPRESSION_TRUE: RegExp = /^(1|true)$/i;

export const EXPRESSION_WHITESPACE: RegExp = /\s+/;

export const EXPRESSION_WINDOW: RegExp = /^window$/i;

export const FORMAT_PRETTY = 'pretty';

export const FORMAT_RAW = 'raw';

export const PREFIX_CONTROLLER = ':';

export const PREFIX_INPUT = 'input:';

export const PREFIX_OUTPUT = 'output:';

export const PREFIX_TARGET = 'target:';

export const SYMBOL: unique symbol = Symbol('magnus');

export const TYPE_ACTION = 'action';

export const TYPE_CONTROLLER = 'controller';

export const TYPE_DATA = 'data';

export const TYPE_INPUT = 'input';

export const TYPE_OUTPUT = 'output';

export const TYPE_TARGET = 'target';

export const EXPRESSION_ATTRIBUTES: RegExp[] = [
	EXPRESSION_ACTION_ATTRIBUTE_NAME,
	EXPRESSION_CONTROLLER_ATTRIBUTE_FULL,
	EXPRESSION_DATA_ATTRIBUTE,
	EXPRESSION_INPUT_ATTRIBUTE,
	EXPRESSION_OUTPUT_ATTRIBUTE,
	EXPRESSION_TARGET_ATTRIBUTE_FULL,
];

export const EXPRESSION_ATTRIBUTES_LENGTH: number = EXPRESSION_ATTRIBUTES.length;

export const TYPES_ATTRIBUTE: ParsedAttributeType[] = [
	TYPE_ACTION,
	TYPE_CONTROLLER,
	TYPE_DATA,
	TYPE_INPUT,
	TYPE_OUTPUT,
	TYPE_TARGET,
];

export const TYPES_DATA: Set<DataType> = new Set([
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

export const TYPES_FORMAT: Set<DataFormat> = new Set([FORMAT_PRETTY, FORMAT_RAW]);

// #endregion
