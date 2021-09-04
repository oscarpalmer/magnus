export interface IObserver {
  start: () => void;
  stop: () => void;
}

const observerAttributes = 'attributes';
const observerChildList = 'childList';

export const observerOptions: MutationObserverInit = {
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true,
};

export abstract class Observer implements IObserver {
  protected readonly observer: MutationObserver;

  constructor(protected readonly element: Element) {
    this.observer = new MutationObserver(this.observe.bind(this));
  }

  start(): void {
    this.observer.observe(this.element, this.getOptions());

    this.handleNodes([this.element], true);
  }

  stop(): void {
    this.observer.disconnect();
  }

  protected getAttributes(oldAttribute: string, newAttribute: string): string[][] {
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

  protected abstract getOptions(): MutationObserverInit;

  protected abstract handleAttribute(element: Element, attributeName: string, oldValue: string, removedElement?: boolean): void;

  protected abstract handleElement(element: Element, added: boolean): void;

  private handleNodes(nodes: NodeList | Node[], added: boolean): void {
    for (const node of (nodes || [])) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.handleElement(node as Element, added);
        this.handleNodes(node.childNodes, added);
      }
    }
  }

  private observe(entries: MutationRecord[]): void {
    for (const entry of entries) {
      if (entry.type === observerChildList) {
        this.handleNodes(entry.addedNodes, true);
        this.handleNodes(entry.removedNodes, false);
      } else if (entry.type === observerAttributes) {
        this.handleAttribute(entry.target as Element, entry.attributeName || '', entry.oldValue || '');
      }
    }
  }
}
