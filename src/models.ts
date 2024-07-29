import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import type {Controller} from './controller';

export type Action = {
	callback: (event: Event) => void;
	options: AddEventListenerOptions;
	targets: Set<EventTarget>;
	type: string;
};

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

//

export type AttributeChangeCallback = (
	element: Element,
	value: string,
	added: boolean,
) => void;

export type AttributeChangesParameters = {
	callback: AttributeChangeCallback;
	element: Element;
	from: string;
	name: string;
	to: string;
};

export type AttributeHandleCallback = (
	context: Context,
	element: Element,
	value: string,
	added: boolean,
	custom?: {
		event: string;
		handler: GenericCallback;
	},
) => void;

export type AttributeHandleCallbackCustomParameters = {
	event: string;
	handler: GenericCallback;
};

export type AttributeHandleParameters = {
	added: boolean;
	callback: AttributeChangeCallback;
	element: Element;
	name: string;
	value: string;
};

//

export type Context = {
		readonly actions: Actions;
		readonly controller: Controller;
		readonly data: Data;
		readonly element: Element;
		readonly name: string;
		readonly observer: Observer;
		readonly targets: Targets;
	};

//

export type ControllerConstructor = new (context: Context) => Controller;

//

export type Data = {
	value: PlainObject;
};

export type DataType = 'boolean' | 'parseable' | 'string';

//

export type EventParameters = {
	callback: string;
	external?: EventController;
	options: AddEventListenerOptions;
	type: string;
};

export type EventController = {
	id?: string;
	name: string;
};

export type EventMatches = {
	callback: string;
	event?: string;
	id?: string;
	name?: string;
	options?: string;
};

//

export type Observer = {
	start(): void;
	stop(): void;
	update(): void;
};

export type ObserverCallback = (
	element: Element,
	name: string,
	value: string,
	added: boolean,
) => void;

//

export type ParsedAttribute = {
	id?: string;
	name: string;
	value: string;
};

//

export type StoredController = {
	constructor: ControllerConstructor;
	instances: Map<Element, Context>;
};

//

export type Targets = {
	add(name: string, element: Element): void;
	clear(): void;
	get(name: string): Element[];
	remove(name: string, element: Element): void;
};
