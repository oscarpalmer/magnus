import { Context } from '../context';

class DataStoreHandlers {
  private static readonly PATTERN = /^\w/;

  constructor (private readonly store: DataStore) {}

  get (target: any, property: string | symbol): any {
    return Reflect.get(target, property);
  }

  set (target: any, property: string | symbol, value: any): boolean {
    this.handleValue(property as string, Reflect.get(target, property), value);

    return Reflect.set(target, property, value);
  }

  private getProperty (property: string): string {
    return property.replace(DataStoreHandlers.PATTERN, (character) => character.toUpperCase());
  }

  private handleValue (property: string, oldValue: any, newValue: any): void {
    let callback: Function|undefined;

    if (this.store.callbacks.has(property)) {
      callback = this.store.callbacks.get(property);

      if (typeof callback === 'function') {
        callback.call(this.store.context.controller, newValue, oldValue);
      }

      return;
    }

    callback = (this.store.context.controller as any)[`data${this.getProperty(property)}Changed`];

    this.store.callbacks.set(property, callback);

    if (typeof callback === 'function') {
      callback.call(this.store.context.controller, newValue, oldValue);
    }
  }
}

export class DataStore {
  readonly callbacks: Map<string, Function|undefined>;
  readonly handlers: DataStoreHandlers;
  readonly proxy: any;

  constructor (readonly context: Context) {
    this.callbacks = new Map();
    this.handlers = new DataStoreHandlers(this);

    this.proxy = new Proxy({}, this.handlers);
  }
}
