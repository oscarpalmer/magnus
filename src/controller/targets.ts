import {Context} from './context';

export class Targets {
  constructor(protected readonly context: Context) {}

  exists(name: string): boolean {
    return this.context.store.targets.has(name);
  }

  get<ElementType extends Element>(name: string): ElementType[] {
    return this.context.store.targets.get(name) as ElementType[];
  }

  find<ElementType extends Element>(selector: string): ElementType[] {
    return Array.from(this.context.element.querySelectorAll(selector));
  }
}
