// Generated by dts-bundle-generator v9.5.1

/**
Represents an object with `unknown` value. You probably want this instead of `{}`.

Use case: You have an object whose keys and values are unknown to you.

@example
```
import type {UnknownRecord} from 'type-fest';

function toJson(object: UnknownRecord) {
	return JSON.stringify(object);
}

toJson({hello: 'world'});
//=> '{"hello":"world"}'

function isObject(value: unknown): value is UnknownRecord {
	return typeof value === 'object' && value !== null;
}

isObject({hello: 'world'});
//=> true

isObject('hello');
//=> false
```

@category Type
@category Object
*/
export type UnknownRecord = Record<PropertyKey, unknown>;
export type PlainObject = UnknownRecord;
declare class Observer {
	private readonly element;
	private readonly options;
	private readonly callback;
	private frame;
	private readonly observer;
	private running;
	constructor(element: Element, options: MutationObserverInit, callback: ObserverCallback);
	start(): void;
	stop(): void;
	update(): void;
}
declare class Actions {
	private readonly store;
	add(name: string, target: EventTarget): void;
	clear(): void;
	create(parameters: ActionParameters, target: EventTarget): void;
	has(name: string): boolean;
	remove(name: string, target: EventTarget): void;
}
declare class Data {
	readonly value: PlainObject;
	constructor(context: Context);
}
declare class Targets {
	private readonly context;
	private readonly callbacks;
	private readonly store;
	get readonly(): ReadonlyTargets;
	constructor(context: Context);
	add(name: string, element: Element): void;
	clear(): void;
	find(selector: string): Element[];
	get(name: string): Element | undefined;
	getAll(name: string): Element[];
	has(name: string): boolean;
	remove(name: string, element: Element): void;
}
export type RemoveEventListener = () => void;
declare class Events {
	private readonly context;
	constructor(context: Context);
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
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	dispatch<Type extends keyof HTMLElementEventMap>(type: Type, target: ExtendedEventTarget): void;
	/**
	 * - Dispatch an event for a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	dispatch(type: string, target: ExtendedEventTarget): void;
	/**
	 * - Dispatch an event with specific options
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - It target is not provided, the controller's element will be used
	 */
	dispatch<Type extends keyof HTMLElementEventMap>(type: Type, options: CustomEventInit, target?: ExtendedEventTarget): void;
	/**
	 * - Dispatch an event with specific options
	 * ---
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
	 * - Remove an event listener from a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	off<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener, target: ExtendedEventTarget): void;
	/**
	 * - Remove an event listener from a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	off(type: string, listener: EventListener, target: ExtendedEventTarget): void;
	/**
	 * - Remove an event listener from a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	off<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener, options: boolean | EventListenerOptions, target?: ExtendedEventTarget): void;
	/**
	 * - Remove an event listener from a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 */
	off(type: string, listener: EventListener, options: boolean | EventListenerOptions, target?: ExtendedEventTarget): void;
	/**
	 * - Add an event listener to the controller's element
	 * ---
	 * - Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener): RemoveEventListener;
	/**
	 * - Add an event listener to the controller's element
	 * ---
	 * - Returns a function that removes the event listener
	 */
	on(type: string, listener: EventListener): RemoveEventListener;
	/**
	 * - Add an event listener to a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener, target: ExtendedEventTarget): RemoveEventListener;
	/**
	 * - Add an event listener to a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on(type: string, listener: EventListener, target: ExtendedEventTarget): RemoveEventListener;
	/**
	 * - Add an event listener to a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on<Type extends keyof HTMLElementEventMap>(type: Type, listener: EventListener, options: boolean | AddEventListenerOptions, target?: ExtendedEventTarget): RemoveEventListener;
	/**
	 * - Add an event listener to a target element
	 * ---
	 * - If target is a `string`, the controller will use the first matching target element
	 * - Returns a function that removes the event listener
	 */
	on(type: string, listener: EventListener, options: boolean | AddEventListenerOptions, target?: ExtendedEventTarget): RemoveEventListener;
}
declare class Context {
	readonly name: string;
	readonly element: Element;
	readonly actions: Actions;
	readonly controller: InstanceType<ControllerConstructor>;
	readonly data: Data;
	readonly events: Events;
	readonly observer: Observer;
	readonly targets: Targets;
	constructor(name: string, element: Element, ctor: ControllerConstructor);
}
export type ActionParameters = {
	callback: (event: Event) => void;
	name: string;
	options: AddEventListenerOptions;
	type: string;
};
export type ControllerConstructor = new (context: Context) => Controller;
export type ExtendedEventTarget = string | EventTarget;
export type ObserverCallback = (element: Element, name: string, value: string) => void;
export type ReadonlyTargets = {
	/**
	 * Find elements within the controller's element
	 */
	find<Found extends Element = Element>(selector: string): Found[];
	/**
	 * Get the first element with the given target name
	 */
	get<Target extends Element = Element>(name: string): Target | undefined;
	/**
	 * Get all elements with the given target name
	 */
	getAll<Target extends Element = Element>(name: string): Target[];
	/**
	 * Does the controller have any elements with the given target name?
	 */
	has(name: string): boolean;
};
export declare abstract class Controller<Data extends PlainObject = PlainObject> {
	protected readonly context: Context;
	/**
	 * Get the controller's data
	 */
	get data(): Data;
	/**
	 * Set the controller's data
	 */
	set data(value: Data | null | undefined);
	/**
	 * The controller's primary element
	 */
	get element(): Element;
	/**
	 * Events helper
	 */
	get events(): Events;
	/**
	 * Controller name
	 */
	get name(): string;
	/**
	 * The controller's targets
	 */
	get targets(): ReadonlyTargets;
	constructor(context: Context);
	/**
	 * Called when the controller is connected
	 */
	connect(): void;
	/**
	 * Called when the controller is disconnected
	 */
	disconnect(): void;
}
declare class Magnus {
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
}
export declare const magnus: Magnus;

export {};
