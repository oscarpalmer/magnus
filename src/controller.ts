import { Context } from './context';
import { Events } from './events'
import { KeyValueStore } from './models';

export type Constructor = new (context: Context) => Controller;

export interface Controller {
  connect?(): void;
  disconnect?(): void;
}

export abstract class Controller {
  constructor (readonly context: Context) {}

  get classes(): KeyValueStore<string> {
    return this.context.store.classes.values;
  }

  get data(): KeyValueStore<unknown> {
    return this.context.store.data.proxy;
  }

  get element(): Element {
    return this.context.element;
  }

  get events(): Events {
    return this.context.events;
  }

  get identifier(): string {
    return this.context.identifier;
  }

  protected hasTarget(name: string): boolean {
    return this.context.store.targets.has(name);
  }

  protected target(name: string): Element | undefined {
    return this.context.store.targets.get(name)[0];
  }

  protected targets(name: string): Element[] {
    return this.context.store.targets.get(name);
  }
}
