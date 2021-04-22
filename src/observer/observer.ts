export interface IObserver {
  disconnect: () => void
  handleNodes: (nodes: NodeList, added: boolean) => void
  observe: () => void
}

export abstract class Observer implements IObserver {
  protected static readonly MUTATION_OBSERVER_OPTIONS: MutationObserverInit = {
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true,
  };

  protected static readonly MUTATION_RECORD_CHILDLIST: string = 'childList';

  protected readonly element: HTMLElement;
  protected readonly mutationObserver: MutationObserver;
  protected readonly mutationObserverOptions: MutationObserverInit;

  constructor (element: HTMLElement) {
    this.element = element;

    this.mutationObserverOptions = this.getOptions();

    this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
  }

  disconnect (): void {
    this.mutationObserver.disconnect();
  }

  handleNodes (nodes: NodeList, added: boolean): void {
    for (const node of (nodes ?? [])) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.handleElement(node as HTMLElement, added);
        this.handleNodes(node.childNodes, added);
      }
    }
  }

  observe (): void {
    this.mutationObserver.observe(this.element, this.mutationObserverOptions);

    this.handleNodes(this.element.childNodes, true);
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

  protected abstract getOptions (): MutationObserverInit;

  protected abstract handleAttribute (element: HTMLElement, attributeName: string, oldValue: string, removedElement?: boolean): void;

  protected abstract handleElement (element: HTMLElement, added: boolean): void;

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
