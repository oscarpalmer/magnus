import { Context } from './context';
import { DataChange, KeyValueStore, TargetChange } from './models';

export type Constructor = new (context: Context) => Controller;

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

  get identifier(): string {
    return this.context.identifier;
  }

  connect(): void {
    // Can be overridden in custom controllers
  }

  dataChanged(data: DataChange): void {
    // Can be overridden in custom controllers
  }

  disconnect(): void {
    // Can be overridden in custom controllers
  }

  hasTarget(name: string): boolean {
    return this.context.store.targets.has(name);
  }

  target(name: string): Element | undefined {
    return this.context.store.targets.get(name)[0];
  }

  targetChanged(target: TargetChange): void {
    // Can be overridden in custom controllers
  }

  targets(name: string): Element[] {
    return this.context.store.targets.get(name);
  }
}
