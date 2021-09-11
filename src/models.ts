import { Controller, Constructor } from './controller';

export interface ActionParameters {
  action: string;
  name: string;
  options?: string;
  type: string;
}

export interface ActionOptions {
  capture: boolean;
  once: boolean;
  passive: boolean;
}

export interface Action {
  callback: (event: Event) => void;
  elements: Set<Element>;
  options: ActionOptions;
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

export interface IObserver {
  start: () => void;
  stop: () => void;
}

export interface KeyValueStore<T> {
  [key: string]: T;
}

export interface StoredController {
  constructor: Constructor;
  instances: Map<Element, Controller>;
}

export interface TargetChange {
  added: boolean;
  element: Element;
  name: string;
}
