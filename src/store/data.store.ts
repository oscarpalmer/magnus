import { debounce, getDataAttributeName, getStringValue } from '../helpers';
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

export interface DataTimers {
  [property: string]: number | undefined;
}

export interface MagnusProxy {
  [property: string]: unknown;
}

class DataStoreHandlers {
  private get controller(): Controller {
    return this.store.context.controller;
  }

  constructor(private readonly store: DataStore) {}

  get(target: MagnusProxy, property: string | symbol): unknown {
    return Reflect.get(target, property);
  }

  set(target: MagnusProxy, property: string | symbol, value: unknown): boolean {
    const oldValue: unknown = Reflect.get(target, property);
    const set: boolean = Reflect.set(target, property, value);

    if (set) {
      debounce(this.store.timers, property as string, () => {
        this.store.setAttribute(property as string, value);
      });

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

  setAttribute(property: string, value: unknown): void {
    if (this.skip[property] != null) {
      delete this.skip[property];

      return;
    }

    this.skip[property] = 0;

    if (value == null || value === '') {
      this.context.element.removeAttribute(getDataAttributeName(this.context.identifier, property));

      return;
    }

    this.context.element.setAttribute(getDataAttributeName(this.context.identifier, property), getStringValue(value));
  }
}
