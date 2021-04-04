export default class Store {
  private readonly elements: Map<string, Set<HTMLElement>>;

  readonly actions: Map<string, Function>;

  constructor () {
    this.actions = new Map();
    this.elements = new Map();
  }

  addElement (key: string, element: HTMLElement): void {
    if (this.elements.has(key)) {
      this.elements.get(key)?.add(element);
    } else {
      this.elements.set(key, new Set()).get(key)?.add(element);
    }
  }

  getElements (key: string): HTMLElement[] {
    const elements: Set<HTMLElement>|undefined = this.elements.get(key);

    return elements != null
      ? Array.from(elements)
      : [];
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
