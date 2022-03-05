import {Context} from '../controller/context';

export class TargetStore {
  private readonly targets: Map<string, Set<Element>>;

  constructor(private readonly context: Context) {
    this.targets = new Map();
  }

  add(name: string, element: Element): void {
    if (this.targets.has(name)) {
      this.targets.get(name)?.add(element);
    } else {
      this.targets.set(name, new Set()).get(name)?.add(element);
    }

    this.context.events.target.emit({ name, added: true, target: element, });
  }

  clear(): void {
    const targets = this.targets.values();

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
    const targets = this.targets.get(name);

    if (targets == null) {
      return;
    }

    targets.delete(element);

    if (targets.size === 0) {
      this.targets.delete(name);
    }

    this.context.events.target.emit({ name, added: false, target: element, });
  }
}
