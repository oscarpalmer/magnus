interface Action {
  callback: Function
  elements: Set<HTMLElement>
  type: string
}

export class Store {
  private readonly actions: Map<string, Action>;
  private readonly elements: Map<string, Set<HTMLElement>>;

  constructor () {
    this.actions = new Map();
    this.elements = new Map();
  }

  addAction (key: string, element: HTMLElement): void {
    const action: Action|undefined = this.actions.get(key);

    if (action == null) {
      return;
    }

    action.elements.add(element);

    element.addEventListener(action.type, action.callback as EventListenerOrEventListenerObject);
  }

  addElement (key: string, element: HTMLElement): void {
    if (this.elements.has(key)) {
      this.elements.get(key)?.add(element);
    } else {
      this.elements.set(key, new Set()).get(key)?.add(element);
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

  getElements (key: string): HTMLElement[] {
    const elements: Set<HTMLElement>|undefined = this.elements.get(key);

    return elements != null
      ? Array.from(elements)
      : [];
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

  removeElement (key: string, element: HTMLElement): void {
    if (this.elements.has(key)) {
      this.elements.get(key)?.delete(element);

      if (this.elements.get(key)?.size === 0) {
        this.elements.delete(key);
      }
    }
  }
}
