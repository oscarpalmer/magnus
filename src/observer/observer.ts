export interface IObserver {
  disconnect: () => void
  handleNodes: (nodes: NodeList, added: boolean) => void
  observe: () => void
}

export abstract class Observer implements IObserver {
  protected static readonly CONTROLLER_ATTRIBUTE = 'data-controller';

  protected static readonly MUTATION_OBSERVER_OPTIONS: MutationObserverInit = {
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true,
  };

  protected static readonly MUTATION_RECORD_CHILDLIST = 'childList';

  protected readonly attributeAction: string;
  protected readonly attributeTarget: string;
  protected readonly element: HTMLElement;
  protected readonly identifier: string;
  protected readonly mutationObserver: MutationObserver;
  protected readonly mutationOptions: MutationObserverInit;

  constructor (identifier: string, element: HTMLElement) {
    this.identifier = identifier;
    this.element = element;

    this.attributeAction = `data-${this.identifier}-action`;
    this.attributeTarget = `data-${this.identifier}-target`;

    this.mutationOptions = this.getOptions();

    this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
  }

  disconnect (): void {
    this.mutationObserver.disconnect();
  }

  handleNodes (nodes: NodeList, added: boolean): void {
    if (nodes != null && nodes.length > 0) {
      for (const node of nodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.handleElement(node as HTMLElement, added);
          this.handleNodes(node.childNodes, added);
        }
      }
    }
  }

  observe (): void {
    this.mutationObserver.observe(this.element, Observer.MUTATION_OBSERVER_OPTIONS);
  }

  protected getAttributes (oldAttribute: string, newAttribute: string): string[][] {
    const oldAttributeValues: string[] = oldAttribute.split(' ');
    const newAttributeValues: string[] = newAttribute.split(' ');

    const addedValues: string[] = [];
    const removedValues: string[] = [];

    for (const value of oldAttributeValues) {
      if (value !== '' && newAttributeValues.indexOf(value) === -1) {
        removedValues.push(value);
      }
    }

    for (const value of newAttributeValues) {
      if (value !== '' && oldAttributeValues.indexOf(value) === -1) {
        addedValues.push(value);
      }
    }

    return [addedValues, removedValues];
  }

  protected abstract handleAttribute (element: HTMLElement, attributeName: string, oldValue: string): void;

  protected abstract handleElement (element: HTMLElement, added: boolean): void;

  private getOptions (): MutationObserverInit {
    const options: MutationObserverInit = Observer.MUTATION_OBSERVER_OPTIONS;

    if (this.element === document.documentElement) {
      options.attributeFilter = [Observer.CONTROLLER_ATTRIBUTE];

      return options;
    }

    options.attributeFilter = [
      this.attributeAction,
      this.attributeTarget,
    ];

    return options;
  }

  protected observeMutations (entries: MutationRecord[]): void {
    for (const entry of entries) {
      if (entry.type === Observer.MUTATION_RECORD_CHILDLIST) {
        this.handleNodes(entry.addedNodes, true);
        this.handleNodes(entry.removedNodes, false);
      } else {
        this.handleAttribute(entry.target as HTMLElement, entry.attributeName ?? '', entry.oldValue ?? '');
      }
    }
  }
}
