import { IObserver } from '../models';

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

    for (const attribute of oldAttributeValues) {
      if (attribute !== '' && newAttributeValues.indexOf(attribute) === -1) {
        removedValues.push(attribute);
      }
    }

    for (const attribute of newAttributeValues) {
      if (attribute !== '' && oldAttributeValues.indexOf(attribute) === -1) {
        addedValues.push(attribute);
      }
    }

    return [addedValues, removedValues];
  }

  protected abstract getOptions(): MutationObserverInit;

  protected abstract handleAttribute(element: Element, name: string, value: string, removedElement?: boolean): void;

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
