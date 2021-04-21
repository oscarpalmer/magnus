import { ControllerStore } from '../store/controller.store';
import { Observer } from './observer';

export class DocumentObserver extends Observer {
  private readonly store: ControllerStore;

  constructor (store: ControllerStore) {
    super('magnus', document.documentElement);

    this.store = store;
  }

  protected handleAttribute (element: HTMLElement, attributeName: string, oldValue: string): void {
    const newValue: string = element.getAttribute(attributeName) ?? '';

    if (attributeName === Observer.CONTROLLER_ATTRIBUTE && newValue !== oldValue) {
      this.handleChanges(element, attributeName, newValue, oldValue);
    }
  }

  protected handleElement (element: HTMLElement, added: true): void {
    if (!element.hasAttribute(Observer.CONTROLLER_ATTRIBUTE)) {
      return;
    }

    const attributeValue: string = element.getAttribute(Observer.CONTROLLER_ATTRIBUTE) ?? '';
    const attributeParts: string[] = attributeValue.split(' ');

    this.toggleAttributes(element, attributeParts, added);
  }

  private handleChanges (element: HTMLElement, attributeName: string, newValue: string, oldValue: string): void {
    const identifiers: string[][] = this.getAttributes(oldValue, newValue);

    for (let index = 0; index < identifiers.length; index += 1) {
      this.toggleAttributes(element, identifiers[index], index === 0);
    }
  }

  private toggleAttributes (element: HTMLElement, identifiers: string[], added: boolean): void {
    for (const identifier of identifiers) {
      if (added) {
        this.store.add(identifier, element);
      } else {
        this.store.remove(identifier, element);
      }
    }
  }
}
