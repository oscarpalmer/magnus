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

export const EXPRESSION_EVENT_ACTIVE = /^a(ctive)$/i;

export const EXPRESSION_EVENT_CAPTURE = /^c(|apture)$/i;

export const EXPRESSION_EVENT_ONCE = /^o(nce)$/i;

export const EXPRESSION_FALSE = /^(0|false)$/i;

/**
 * - `controller(.identifier).property(:json)`
 * - `[, name, id?, value]`
 */
export const EXPRESSION_IO_ATTRIBUTE_FULL = /^([\w-]+)(?:\.([\w-]+))?\.([\w-]*)(?::json)?$/;

export const EXPRESSION_IO_ATTRIBUTE_PREFIX = /^[\w-]+(?:\.[\w-]+)?\./;

export const EXPRESSION_JSON_SUFFIX = /:json$/;

/**
 * - `controller(.identifier):target`
 * - `[, name, id?, value]`
 */
export const EXPRESSION_TARGET_ATTRIBUTE_FULL = /^([\w-]+)(?:\.([\w-]+))?:([\w-]+)$/;

export const EXPRESSION_TARGET_ATTRIBUTE_PREFIX = /^[\w-]+(?:\.[\w-]+)?:/;

export const EXPRESSION_TIME = /^([01]?\d|2[0-3])(?::([0-5]?\d)(?::([0-5]?\d)(?:\.\d{1,3})?)?)?$/;

export const EXPRESSION_TRUE = /^(1|true)$/i;

//

export const EVENT_CHANGE = new Set(['checkbox', 'radio']);

//

export const TYPE_ACTION = 'action';

export const TYPE_CONTROLLER = 'controller';

export const TYPE_DATA = 'data';

export const TYPE_IO = 'io';

export const TYPE_TARGET = 'target';
