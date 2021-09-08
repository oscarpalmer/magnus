import { Context } from '../context';
import { Controller } from '../controller';

export interface DataChangeValues {
  new: unknown;
  old: unknown;
}

export interface DataChange {
  property: string;
  values: DataChangeValues;
}

interface DataSkip {
  [property: string]: number | undefined;
}

interface DataTimers {
  [property: string]: number | undefined;
}

export interface MagnusProxy {
  [property: string]: unknown;
}

function debounce(store: DataStore, name: string, value: unknown, callback: (property: string, value: unknown) => void) {
  clearTimeout(store.timers[name]);

  store.timers[name] = setTimeout(() => {
    delete store.timers[name];

    callback.call(store.handlers, name, value);
  }, 250);
}

class DataStoreHandlers {
  private get controller(): Controller {
    return this.store.context.controller;
  }

  private get element(): Element {
    return this.store.context.element;
  }

  private get identifier(): string {
    return this.store.context.identifier;
  }

  constructor(private readonly store: DataStore) {}

  get(target: MagnusProxy, property: string | symbol): unknown {
    if (property === 'action') {
      return null;
    }

    return Reflect.get(target, property);
  }

  set(target: MagnusProxy, property: string | symbol, value: unknown): boolean {
    if (property === 'action') {
      return false;
    }

    const oldValue: unknown = Reflect.get(target, property);
    const set: boolean = Reflect.set(target, property, value);

    if (set) {
      debounce(this.store, property as string, value, this.setAttribute);

      if (typeof this.controller.dataChanged === 'function') {
        this.controller.dataChanged.call(this.controller, {
          property: property as string,
          values: {
            new: value,
            old: oldValue,
          },
        });
      }
    }

    return set;
  }

  private getAttributeName(property: string | symbol): string {
    return `data-${this.identifier}-${property as string}`;
  }

  private getAttributeValue(value: unknown): string {
    if (typeof value !== 'object') {
      return value as string;
    }

    try {
      return JSON.stringify(value);
    } catch (error) {
      return `${value}`;
    }
  }

  private setAttribute(property: string, value: unknown): void {
    if (this.store.skip[property] != null) {
      delete this.store.skip[property];

      return;
    }

    this.store.skip[property] = 0;

    if (value == null || value === '') {
      this.element.removeAttribute(this.getAttributeName(property));

      return;
    }

    this.element.setAttribute(this.getAttributeName(property), this.getAttributeValue(value));
  }
}

export class DataStore {
  readonly handlers: DataStoreHandlers;
  readonly proxy: MagnusProxy;

  readonly skip: DataSkip = {};
  readonly timers: DataTimers = {};

  constructor(readonly context: Context) {
    this.handlers = new DataStoreHandlers(this);
    this.proxy = new Proxy({}, this.handlers);
  }
}
