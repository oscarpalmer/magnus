export interface IObserver {
  start: () => void
  stop: () => void
}

export abstract class Observer implements IObserver {
  protected static readonly CHILDLIST: string = 'childList';

  protected static readonly OPTIONS: MutationObserverInit = {
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true,
  };

  protected readonly observer: MutationObserver;
  protected readonly options: MutationObserverInit;

  constructor (protected readonly element: Element) {
    this.options = this.getOptions();

    this.observer = new MutationObserver(this.observe.bind(this));
  }

  start (): void {
    this.observer.observe(this.element, this.options);

    this.handleNodes([this.element], true);
  }

  stop (): void {
    this.observer.disconnect();
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

  protected abstract handleAttribute (element: Element, attributeName: string, oldValue: string, removedElement?: boolean): void;

  protected abstract handleElement (element: Element, added: boolean): void;

  private handleNodes (nodes: NodeList|Node[], added: boolean): void {
    for (const node of (nodes ?? [])) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.handleElement(node as Element, added);
        this.handleNodes(node.childNodes, added);
      }
    }
  }

  private observe (entries: MutationRecord[]): void {
    for (const entry of entries) {
      if (entry.type === Observer.CHILDLIST) {
        this.handleNodes(entry.addedNodes, true);
        this.handleNodes(entry.removedNodes, false);
      } else {
        this.handleAttribute(entry.target as Element, entry.attributeName ?? '', entry.oldValue ?? '');
      }
    }
  }
}
