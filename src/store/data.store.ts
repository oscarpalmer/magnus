import { Context } from '../context';

export interface DataChangeValues {
  new: unknown;
  old: unknown;
}

export interface DataChange {
  property: string;
  values: DataChangeValues;
}

export interface MagnusProxy {
  [key: string]: unknown;
}

class DataStoreHandlers {
  private get callback(): (data: DataChange) => void {
    return this.store.context.controller.dataChanged;
  }

  constructor(private readonly store: DataStore) {}

  get(target: MagnusProxy, property: string | symbol): unknown {
    return Reflect.get(target, property);
  }

  set(target: MagnusProxy, property: string | symbol, value: unknown): boolean {
    return Reflect.set(target, property, value) && this.handleChange(property, Reflect.get(target, property), value);
  }

  private handleChange(property: string | symbol, oldValue: unknown, newValue: unknown): boolean {
    if (typeof this.callback === 'function') {
      this.callback.call(
        this.store.context.controller,
        { property: property as string, values: { new: newValue, old: oldValue, }, });
    }

    return true;
  }
}

export class DataStore {
  readonly handlers: DataStoreHandlers;
  readonly proxy: MagnusProxy;

  constructor(readonly context: Context) {
    this.handlers = new DataStoreHandlers(this);
    this.proxy = new Proxy({}, this.handlers);
  }
}
