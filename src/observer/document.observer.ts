import { ControllerStore } from '../store/controller.store';
import { Observer, observerOptions } from './observer';

const dataControllerAttribute = 'data-controller';

export class DocumentObserver extends Observer {
  constructor(private readonly controllers: ControllerStore) {
    super(document.documentElement);
  }

  protected getOptions(): MutationObserverInit {
    const options: MutationObserverInit = Object.assign({}, observerOptions);

    options.attributeFilter = [dataControllerAttribute];

    return options;
  }

  protected handleAttribute(element: Element, attributeName: string, oldValue: string, removedElement?: boolean): void {
    let newValue: string = element.getAttribute(attributeName) || '';

    if (newValue === oldValue) {
      return;
    }

    if (removedElement === true) {
      oldValue = newValue;
      newValue = '';
    }

    this.handleChanges(element, newValue, oldValue);
  }

  protected handleElement(element: Element, added: true): void {
    if (element.hasAttribute(dataControllerAttribute)) {
      this.handleAttribute(element, dataControllerAttribute, '', !added);
    }
  }

  private handleChanges(element: Element, newValue: string, oldValue: string): void {
    this.getAttributes(oldValue, newValue).forEach((attributes: string[], index: number) => {
      const added: boolean = index === 0;

      for (const attribute of attributes) {
        if (added) {
          this.controllers.add(attribute, element);
        } else {
          this.controllers.remove(attribute, element);
        }
      }
    });
  }
}
