import { Context } from '../context';
import { TargetChange } from '../models';

export class TargetStore {
  private readonly targets: Map<string, Set<Element>>;

  private get callback(): (target: TargetChange) => void {
    return this.context.controller.targetChanged;
  }

  constructor(private readonly context: Context) {
    this.targets = new Map();
  }

  add(name: string, element: Element): void {
    if (this.targets.has(name)) {
      this.targets.get(name)?.add(element);
    } else {
      this.targets.set(name, new Set()).get(name)?.add(element);
    }

    this.handleChange(name, element, true);
  }

  clear(): void {
    const targets: IterableIterator<Set<Element>> = this.targets.values();

    for (const elements of targets) {
      elements.clear();
    }
  }

  get(name: string): Element[] {
    return Array.from(this.targets.get(name) || []);
  }

  has(name: string): boolean {
    return this.targets.has(name);
  }

  remove(name: string, element: Element): void {
    const targets: Set<Element> | undefined = this.targets.get(name);

    if (targets == null) {
      return;
    }

    targets.delete(element);

    if (targets.size === 0) {
      this.targets.delete(name);
    }

    this.handleChange(name, element, false);
  }

  private handleChange(name: string, element: Element, added: boolean): void {
    if (typeof this.callback === 'function') {
      this.callback.call(this.context.controller, { element, name, added, });
    }
  }
}
