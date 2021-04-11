interface Action {
  callback: Function
  elements: Set<HTMLElement>
  type: string
}

export class Store {
  private readonly actions: Map<string, Action>;
  private readonly targets: Map<string, Set<HTMLElement>>;

  constructor () {
    this.actions = new Map();
    this.targets = new Map();
  }

  addAction (key: string, element: HTMLElement): void {
    const action: Action|undefined = this.actions.get(key);

    if (action == null) {
      return;
    }

    action.elements.add(element);

    element.addEventListener(action.type, action.callback as EventListenerOrEventListenerObject);
  }

  addTarget (key: string, element: HTMLElement): void {
    if (this.targets.has(key)) {
      this.targets.get(key)?.add(element);
    } else {
      this.targets.set(key, new Set()).get(key)?.add(element);
    }
  }

  createAction (key: string, type: string, callback: Function): void {
    if (!this.actions.has(key)) {
      this.actions.set(key, {
        callback,
        elements: new Set(),
        type,
      });
    }
  }

  getTargets (key: string): HTMLElement[] {
    return Array.from(this.targets.get(key) ?? []);
  }

  hasAction (key: string): boolean {
    return this.actions.has(key);
  }

  removeAction (key: string, element: HTMLElement): void {
    const action: Action|undefined = this.actions.get(key);

    if (action == null) {
      return;
    }

    element.removeEventListener(action.type, action.callback as EventListenerOrEventListenerObject);

    action.elements.delete(element);

    if (action.elements.size === 0) {
      this.actions.delete(key);
    }
  }

  removeTarget (key: string, element: HTMLElement): void {
    if (this.targets.has(key)) {
      this.targets.get(key)?.delete(element);

      if (this.targets.get(key)?.size === 0) {
        this.targets.delete(key);
      }
    }
  }
}
