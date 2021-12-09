import { Context } from './controller/context';
import { Constructor } from './controller/controller';

export interface ActionParameters {
  action: string;
  name: string;
  options?: string;
  target?: EventTarget;
  type: string;
}

export interface ActionOptions {
  capture: boolean;
  once: boolean;
  passive: boolean;
}

export interface Action {
  callback: (event: Event) => void;
  options: ActionOptions;
  target?: EventTarget;
  targets: Set<EventTarget>;
  type: string;
}

export interface DataChange {
  property: string;
  values: DataChangeValues;
}

export interface DataChangeValues {
  new: unknown;
  old: unknown;
}

export interface Dispatch {
  data?: unknown;
  options?: DispatchOptions;
  target?: EventTarget;
}

export interface DispatchOptions {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

export interface IObserver {
  start: () => void;
  stop: () => void;
}

export interface KeyValueStore<T> {
  [key: string]: T;
}

export interface StoredController {
  constructor: Constructor;
  instances: Map<Element, Context>;
}

export interface TargetChange {
  added: boolean;
  name: string;
  target: Element;
}
