import { debounce, getDataAttributeName, getStringValue } from '../helpers';
import { Context } from '../context';
import { Controller } from '../controller';
import { KeyValueStore } from 'src/models';

class DataStoreHandlers {
  private get controller(): Controller {
    return this.store.context.controller;
  }

  constructor(private readonly store: DataStore) {}

  get(target: KeyValueStore<unknown>, property: string | symbol): unknown {
    return Reflect.get(target, property);
  }

  set(target: KeyValueStore<unknown>, property: string | symbol, value: unknown): boolean {
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
  readonly proxy: KeyValueStore<unknown>;

  readonly skip: KeyValueStore<number> = {};
  readonly timers: KeyValueStore<number> = {};

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
