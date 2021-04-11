export class TargetStore {
  private readonly targets: Map<string, Set<HTMLElement>>;

  constructor () {
    this.targets = new Map();
  }

  add (name: string, element: HTMLElement): void {
    if (this.targets.has(name)) {
      this.targets.get(name)?.add(element);
    } else {
      this.targets.set(name, new Set()).get(name)?.add(element);
    }
  }

  get (name: string): HTMLElement[] {
    return Array.from(this.targets.get(name) ?? []);
  }

  remove (name: string, element: HTMLElement): void {
    const targets: Set<HTMLElement>|undefined = this.targets.get(name);

    if (targets == null) {
      return;
    }

    targets.delete(element);

    if (targets.size === 0) {
      this.targets.delete(name);
    }
  }
}