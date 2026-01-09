import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import type {Controller} from './controller';
import type {Context} from './controller/context';

// Action

export type ActionParameters = {
	callback: (event: Event) => void;
	name: string;
	options: AddEventListenerOptions;
	type: string;
};

// Attribute

export type ActionAttributeHandlerParameters = {
	added: boolean;
	callback: GenericCallback;
	context: Context;
	event: EventAttributeParameters;
	name: string;
	target: EventTarget;
	value: string;
};

export type ActionAttributeStepHandlerParameters = {
	count: number;
	event: EventAttributeParameters;
} & AttributeHandlerCallbackParameters;

export type AttributeChangeCallback = (element: Element, value: string, added: boolean) => void;

export type AttributeHandlerCallback = (parameters: AttributeHandlerCallbackParameters) => void;

export type AttributeHandlerCallbackParameters = {
	added: boolean;
	context: Context;
	custom?: AttributeHandlerCallbackParametersCustom;
	element: Element;
	name: string;
	type: string;
	value: string;
};

type AttributeHandlerCallbackParametersCustom = {
	callback: GenericCallback;
	event: string;
};

export type AttributeHandlerParameters = {
	callback?: AttributeChangeCallback;
	element: Element;
	value: string;
};

export type AttributeType = 'action' | 'controller' | 'data' | 'io' | 'target';

export type ContextualAttributeHandlerParameters = {
	added: boolean;
	element: Element;
	name: string;
	type: AttributeType;
	value: string;
};

export type ParsedAttribute = {
	identifier?: string;
	name: string;
};

// Controller

export type ControllerConstructor = new (context: Context) => Controller;

// Data

export type DataTypes = Record<string, DataType>;

export type DataType =
	| 'array'
	| 'boolean'
	| 'color'
	| 'date'
	| 'datetime'
	| 'number'
	| 'object'
	| 'string'
	| 'time';

export type DataUpdateParameters = {
	context: Context;
	name: string;
	original?: unknown;
	stringified: string;
	target: PlainObject;
};

export type DataValue = {
	original?: unknown;
	stringified: string;
};

// Event

export type EventAttributeParameters = {
	callback: string;
	external?: EventAttributeExternal;
	options: AddEventListenerOptions;
	type: string;
};

type EventAttributeExternal = {
	identifier?: string;
	name: string;
};

export type EventListenerParameters = {
	first?: boolean | AddEventListenerOptions | ExtendedEventTarget;
	listener: EventListener;
	second?: ExtendedEventTarget;
	type: string;
};

export type ExtendedEventTarget = string | EventTarget;

// Observer

export type ObserverCallback = (element: Element, name: string, value: string) => void;

// Targets

export type TargetsCallbacks = {
	/**
	 * Finds the first element with the given tag name within the controller
	 */
	find<TagName extends keyof HTMLElementTagNameMap>(
		tagName: TagName,
	): HTMLElementTagNameMap[TagName] | null;
	/**
	 * Finds the first element matching the given selector within the controller
	 */
	find<Found extends Element = Element>(selector: string): Found | null;
	/**
	 * Finds all elements with the given tag name within the controller
	 */
	findAll<TagName extends keyof HTMLElementTagNameMap>(
		tagName: TagName,
	): Array<HTMLElementTagNameMap[TagName]>;
	/**
	 * Finds all elements matching the given selector within the controller
	 */
	findAll<Found extends Element = Element>(selector: string): Found[];
	/**
	 * Gets the first element with the given target name
	 */
	get<Target extends Element = Element>(name: string): Target | undefined;
	/**
	 * Gets all elements with the given target name
	 */
	getAll<Target extends Element = Element>(name: string): Target[];
	/**
	 * Does the controller have any elements with the given target name?
	 */
	has(name: string): boolean;
};
