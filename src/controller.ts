import { Context } from './context';

export type ControllerConstructor = new(context: Context) => Controller;

export class Controller {
  constructor (readonly context: Context) {}

  get element (): Element {
    return this.context.element;
  }

  get identifier (): string {
    return this.context.identifier;
  }

  connect (): void {}

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
