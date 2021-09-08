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

  protected handleAttribute(element: Element, name: string, value: string, removedElement?: boolean): void {
    let newValue: string = element.getAttribute(name) || '';

    if (newValue === value) {
      return;
    }

    if (removedElement === true) {
      value = newValue;
      newValue = '';
    }

    this.handleChanges(element, newValue, value);
  }

  protected handleElement(element: Element, added: boolean): void {
    if (element.hasAttribute(dataControllerAttribute)) {
      this.handleAttribute(element, dataControllerAttribute, '', !added);
    }
  }

  private handleChanges(element: Element, newValue: string, oldValue: string): void {
    const allAttributes: string[][] = this.getAttributes(oldValue, newValue);

    for (const attributes of allAttributes) {
      const added: boolean = allAttributes.indexOf(attributes) === 0;

      for (const attribute of attributes) {
        if (added) {
          this.controllers.add(attribute, element);
        } else {
          this.controllers.remove(attribute, element);
        }
      }
    }
  }
}
