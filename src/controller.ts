import { Context } from './context';

export type ControllerConstructor = new(context: Context) => Controller;

export abstract class Controller {
  constructor (readonly context: Context) {}

  get data (): any {
    return this.context.store.data.proxy;
  }

  get element (): Element {
    return this.context.element;
  }

  get identifier (): string {
    return this.context.identifier;
  }

  abstract connect (): void;

  abstract disconnect (): void;

  hasTarget (name: string): boolean {
    return this.context.store.targets.has(name);
  }

  target (name: string): Element|undefined {
    return this.context.store.targets.get(name)[0];
  }

  targets (name: string): Element[] {
    return this.context.store.targets.get(name);
  }
}
