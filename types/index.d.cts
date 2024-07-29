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
export type ActionParameters = {
	callback: (event: Event) => void;
	name: string;
	options: AddEventListenerOptions;
	type: string;
};
export type Actions = {
	add(name: string, target: EventTarget): void;
	clear(): void;
	create(parameters: ActionParameters): void;
	has(name: string): boolean;
	remove(name: string, target: EventTarget): void;
};
export type Context = {
	readonly actions: Actions;
	readonly controller: Controller;
	readonly data: Data;
	readonly element: Element;
	readonly name: string;
	readonly observer: Observer;
	readonly targets: Targets;
};
export type ControllerConstructor = new (context: Context) => Controller;
export type Data = {
	value: PlainObject;
};
export type Observer = {
	start(): void;
	stop(): void;
	update(): void;
};
export type Targets = {
	add(name: string, element: Element): void;
	clear(): void;
	get(name: string): Element[];
	remove(name: string, element: Element): void;
};
export declare abstract class Controller<Model extends PlainObject = PlainObject> {
	protected readonly context: Context;
	get element(): Element;
	get data(): Model;
	get name(): string;
	constructor(context: Context);
	abstract connected(): void;
	abstract disconnected(): void;
}
export type Magnus = {
	add(name: string, ctor: ControllerConstructor): void;
	remove(name: string): void;
	start(): void;
	stop(): void;
};
declare const _default: Magnus;

export {
	_default as magnus,
};

export {};
