import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {RemovableEventListener} from '@oscarpalmer/toretto/models';
import type {SYMBOL} from './constants';
import type {Controller} from './controller';

// #region Action

export type Action = {
	readonly callback: (event: Event) => void;
	readonly options: AddEventListenerOptions;
	readonly targets: Set<EventTarget>;
	readonly type: string;
};

export type ActionParameters = {
	callback: (event: Event) => void;
	name: string;
	options: AddEventListenerOptions;
	type: string;
};

export type Actions = {
	readonly store: Map<string, Action>;
	add(name: string, target: EventTarget): void;
	clear(): void;
	create(parameters: ActionParameters, target: EventTarget): void;
	has(name: string): boolean;
	remove(name: string, target: EventTarget): void;
};

// #endregion

// #region Attribute

export type ParsedAttribute = {
	data: ParsedAttributeData;
	matches: [string[], string[] | null | undefined];
	original: ParsedAttributeOriginal;
	type: ParsedAttributeType;
};

export type ParsedAttributeData = {
	identifier?: string;
	name: string;
};

type ParsedAttributeOriginal = {
	name: string;
	value: string | null;
};

export type ParsedAttributeType = 'action' | 'controller' | 'data' | 'input' | 'output' | 'target';

// #endregion

// #region Context

export type Context = {
	readonly actions: Actions;
	readonly controller: InstanceType<ControllerConstructor>;
	readonly data: Data;
	readonly events: Events;
	readonly state: ContextState;
	readonly targets: Targets;
};

type ContextState = {
	element: Element;
	name: string;
};

export type Contexts = {
	readonly store: WeakMap<Element, Record<string, Context>>;

	connect(element: Element, context: Context): void;

	disconnect(element: Element, name?: string): void;

	get(element: Element, name: string): Context | undefined;
};

// #endregion

// #region Controller

export type ControllerConstructor = new (context: Context) => Controller;

export type Controllers = {
	readonly store: Map<string, StoredController>;
	add(name: string, element: Element): void;
	create(name: string, ctor: ControllerConstructor): void;
	find(origin: Element, name: string, id?: string): Context | undefined;
	has(name: string): boolean;
	remove(name: string, element?: Element): void;
};

export type StoredController = {
	readonly ctor: ControllerConstructor;
	readonly instances: Map<Element, Context>;
	readonly types: DataTypes;
};

// #endregion

// #region Data

export type Data = {
	readonly frames: Record<string, number | undefined>;
	readonly types: DataTypes;
	readonly value: PlainObject;
};

export type DataFormat = 'pretty' | 'raw';

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

export type DataTypes = Record<string, DataType>;

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

// #endregion

// #region Event

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

export type Events = {
	/**
	 * Dispatch an event for the controller
	 */
	dispatch<Type extends keyof HTMLElementEventMap>(type: Type): void;

	/**
	 * Dispatch an event for the controller
	 */
	dispatch(type: string): void;

	/**
	 * - Dispatch an event for a target element
	 *
	 * If target is a `string`, the controller will use the first matching target element
	 */
	dispatch<Type extends keyof HTMLElementEventMap>(type: Type, target: ExtendedEventTarget): void;

	/**
	 * - Dispatch an event for a target element
	 *
	 * If target is a `string`, the controller will use the first matching target element
	 */
	dispatch(type: string, target: ExtendedEventTarget): void;

	/**
	 * - Dispatch an event with specific options
	 *
	 * - If target is a `string`, the controller will use the first matching target element
	 * - It target is not provided, the controller's element will be used
	 */
	dispatch<Type extends keyof HTMLElementEventMap>(
		type: Type,
		options: CustomEventInit,
		target?: ExtendedEventTarget,
	): void;

	/**
	 * - Dispatch an event with specific options
	 *
	 * - If target is a `string`, the controller will use the first matching target element
	 * - It target is not provided, the controller's element will be used
	 */
	dispatch(type: string, options?: CustomEventInit, target?: ExtendedEventTarget): void;

	/**
	 * Remove an event listener from the controller's element
	 */
	off<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener): void;

	/**
	 * Remove an event listener from the controller's element
	 */
	off(type: string, listener: EventListener): void;

	/**
	 * Remove an event listener from a target element
	 *
	 * If target is a `string`, the controller will use the first matching target element
	 */
	off<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
		target: ExtendedEventTarget,
	): void;

	/**
	 * Remove an event listener from a target element
	 *
	 * If target is a `string`, the controller will use the first matching target element
	 */
	off(type: string, listener: EventListener, target: ExtendedEventTarget): void;

	/**
	 * Remove an event listener from a target element
	 *
	 * If target is a `string`, the controller will use the first matching target element
	 */
	off<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
		options: boolean | EventListenerOptions,
		target?: ExtendedEventTarget,
	): void;

	/**
	 * Remove an event listener from a target element
	 *
	 * If target is a `string`, the controller will use the first matching target element
	 */
	off(
		type: string,
		listener: EventListener,
		options: boolean | EventListenerOptions,
		target?: ExtendedEventTarget,
	): void;

	/**
	 * - Add an event listener to the controller's element
	 *
	 * Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
	): RemovableEventListener;

	/**
	 * - Add an event listener to the controller's element
	 *
	 * Returns a function that removes the event listener
	 */
	on(type: string, listener: EventListener): RemovableEventListener;

	/**
	 * - Add an event listener to a target element
	 *
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
		target: ExtendedEventTarget,
	): RemovableEventListener;

	/**
	 * - Add an event listener to a target element
	 *
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on(type: string, listener: EventListener, target: ExtendedEventTarget): RemovableEventListener;

	/**
	 * - Add an event listener to a target element
	 *
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(
		type: Type,
		listener: EventListener,
		options: boolean | AddEventListenerOptions,
		target?: ExtendedEventTarget,
	): RemovableEventListener;

	/**
	 * - Add an event listener to a target element
	 *
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on(
		type: string,
		listener: EventListener,
		options: boolean | AddEventListenerOptions,
		target?: ExtendedEventTarget,
	): RemovableEventListener;
};

export type ExtendedEventTarget = string | EventTarget;

// #endregion

// #region Internals

export type InternalEvents = {
	[SYMBOL]: Context;
};

// #endregion

// #region Magnus

export type Magnus = {
	/**
	 * Is Magnus active?
	 */
	get active(): boolean;

	/**
	 * Adds a named controller to observe
	 */
	add(name: string, ctor: ControllerConstructor): void;

	/**
	 * Removes a named controller _(and all its instances)_ from observation
	 */
	remove(name: string): void;

	/**
	 * Starts the observer
	 */
	start(): void;

	/**
	 * Stops the observer
	 */
	stop(): void;
};

// #endregion

// #region Observer

export type Observer = {
	readonly observer: MutationObserver;
	start(): void;
	stop(): void;
	update(): void;
};

// #endregion

// #region Target

export type Targets = {
	readonly callbacks: TargetsCallbacks | undefined;
	readonly context: Context;
	readonly store: Map<string, Set<Element>>;
	get readonly(): TargetsCallbacks;
	add(name: string, element: Element): void;
	clear(): void;
	find(selector: string): Element | null;
	findAll(selector: string): Element[];
	get(name: string): Element | undefined;
	getAll(name: string): Element[];
	has(name: string): boolean;
	remove(name: string, element: Element): void;
};

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

// #endregion
