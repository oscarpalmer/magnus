import Store from './store';

export default class Observer {
  private static readonly MUTATION_OBSERVER_OPTIONS: MutationObserverInit = {
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true,
  };

  private readonly attributeAction: string;
  private readonly attributeTarget: string;
  private readonly element: HTMLElement;
  private readonly identifier: string;
  private readonly mutationObserver: MutationObserver;
  private readonly mutationOptions: MutationObserverInit;
  private readonly store: Store;

  constructor (identifier: string, element: HTMLElement, store: Store) {
    this.identifier = identifier;
    this.element = element;
    this.store = store;

    this.attributeAction = `data-${this.identifier}-action`;
    this.attributeTarget = `data-${this.identifier}-target`;

    this.mutationOptions = Observer.MUTATION_OBSERVER_OPTIONS;

    this.mutationOptions.attributeFilter = [
      this.attributeAction,
      this.attributeTarget,
    ];

    this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
  }

  disconnect (): void {
    this.mutationObserver.disconnect();
  }

  handleNodes (nodes: NodeList, added: boolean): void {
    if (nodes == null || nodes.length === 0) {
      return;
    }

    for (const node of nodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const element: HTMLElement = node as HTMLElement;

      if (added && element.hasAttribute(this.attributeAction)) {
        this.handleAction(element);
      }

      if (element.hasAttribute(this.attributeTarget)) {
        this.handleTarget(element, added);
      }

      this.handleNodes(element.childNodes, added);
    }
  }

  observe (): void {
    this.mutationObserver.observe(this.element, Observer.MUTATION_OBSERVER_OPTIONS);
  }

  private handleAction (element: HTMLElement): void {
    const attributeValue: string = element.getAttribute(this.attributeAction) ?? '';
    const attributeParts: string[] = attributeValue.split(' ');

    attributeParts.forEach((part) => {
      const x: string[] = part.split(':');

      if (x.length < 2) {
        return;
      }

      const callback: Function|undefined = this.store.actions.get(x[1]);

      if (typeof callback === 'function') {
        element.addEventListener(x[0], callback as EventListenerOrEventListenerObject);
      }
    });
  }

  private handleTarget (element: HTMLElement, added: boolean): void {
    const attributeValue: string = element.getAttribute(this.attributeTarget) ?? '';
    const attributeParts: string[] = attributeValue.split(' ');

    attributeParts.forEach((part: string) => {
      if (added) {
        this.store.addElement(part, element);
      } else {
        this.store.removeElement(part, element);
      }
    });
  }

  private observeMutations (entries: MutationRecord[]): void {
    for (const entry of entries) {
      // TODO: attribute changes
      this.handleNodes(entry.addedNodes, true);
      this.handleNodes(entry.removedNodes, false);
    }
  }
}
