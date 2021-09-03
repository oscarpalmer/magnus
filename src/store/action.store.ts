export interface Action {
  callback: (event: Event) => void;
  elements: Set<Element>;
  type: string;
}

export class ActionStore {
  private readonly actions: Map<string, Action>;

  constructor() {
    this.actions = new Map();
  }

  add(name: string, element: Element): void {
    const action: Action | undefined = this.actions.get(name);

    if (action == null) {
      return;
    }

    action.elements.add(element);

    element.addEventListener(action.type, action.callback);
  }

  clear(): void {
    this.actions.forEach((action: Action) => {
      action.elements.forEach((element: Element) => {
        element.removeEventListener(action.type, action.callback);
      });

      action.elements.clear();
    });
  }

  create(name: string, type: string, callback: (this: Element, event: Event) => void): void {
    if (!this.actions.has(name)) {
      this.actions.set(name, {
        callback,
        elements: new Set(),
        type,
      });
    }
  }

  has(name: string): boolean {
    return this.actions.has(name);
  }

  remove(name: string, element: Element): void {
    const action: Action | undefined = this.actions.get(name);

    if (action == null) {
      return;
    }

    action.elements.delete(element);

    element.removeEventListener(action.type, action.callback);

    if (action.elements.size === 0) {
      this.actions.delete(name);
    }
  }
}
