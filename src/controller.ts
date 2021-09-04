import { Context } from './context';
import { DataChange, MagnusProxy } from './store/data.store';
import { TargetChange } from './store/target.store';

export type ControllerConstructor = new(context: Context) => Controller;

export abstract class Controller {
  constructor (readonly context: Context) {}

  get data(): MagnusProxy {
    return this.context.store.data.proxy;
  }

  get element(): Element {
    return this.context.element;
  }

  get identifier(): string {
    return this.context.identifier;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  connect(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  dataChanged(data: DataChange): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  hasTarget(name: string): boolean {
    return this.context.store.targets.has(name);
  }

  target(name: string): Element | undefined {
    return this.context.store.targets.get(name)[0];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  targetChanged(target: TargetChange): void {}

  targets(name: string): Element[] {
    return this.context.store.targets.get(name);
  }
}
