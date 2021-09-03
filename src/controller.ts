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

  abstract connect(): void;

  abstract dataChanged(data: DataChange): void;

  abstract disconnect(): void;

  hasTarget(name: string): boolean {
    return this.context.store.targets.has(name);
  }

  target(name: string): Element | undefined {
    return this.context.store.targets.get(name)[0];
  }

  targets(name: string): Element[] {
    return this.context.store.targets.get(name);
  }

  abstract targetChanged(target: TargetChange): void;
}
