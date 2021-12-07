import { Context } from './context';

export class Targets {
  constructor(protected readonly context: Context) {}

  exists(name: string): boolean {
    return this.context.store.targets.has(name);
  }

  get(name: string): Element[] {
    return this.context.store.targets.get(name);
  }

  find(selector: string): Element[] {
    return Array.from(this.context.element.querySelectorAll(selector));
  }
}
