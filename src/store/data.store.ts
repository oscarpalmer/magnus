import {KeyValueStore} from '../models';
import {debounce, getDataAttributeName, getStringValue} from '../helpers';
import {Context} from '../controller/context';
import {Controller} from '../controller/controller';

class DataStoreHandlers {
  private get controller(): Controller {
    return this.store.context.controller;
  }

  constructor(private readonly store: DataStore) {}

  get(target: KeyValueStore<unknown>, property: string|symbol): unknown {
    return Reflect.get(target, property);
  }

  set(target: KeyValueStore<unknown>, property: string|symbol, value: unknown): boolean {
    const oldValue = Reflect.get(target, property);
    const set = Reflect.set(target, property, value);

    if (set) {
      debounce(this.store.timers, property as string, () => {
        this.store.setAttribute(property as string, value);
      });

      this.controller.events.data.emit({
        property: property as string,
        values: {
          new: value,
          old: oldValue,
        },
      });
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
