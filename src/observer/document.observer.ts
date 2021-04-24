import { ControllerStore } from '../store/controller.store';
import { Observer } from './observer';

export class DocumentObserver extends Observer {
  private static readonly ATTRIBUTE: string = 'data-controller';

  constructor (private readonly controllers: ControllerStore) {
    super(document.documentElement);
  }

  protected getOptions (): MutationObserverInit {
    const options: MutationObserverInit = Object.assign({}, Observer.OPTIONS);

    options.attributeFilter = [DocumentObserver.ATTRIBUTE];

    return options;
  }

  protected handleAttribute (element: Element, attributeName: string, oldValue: string, removedElement?: boolean): void {
    let newValue: string = element.getAttribute(attributeName) ?? '';

    if (newValue === oldValue) {
      return;
    }

    if (removedElement === true) {
      oldValue = newValue;
      newValue = '';
    }

    this.handleChanges(element, newValue, oldValue);
  }

  protected handleElement (element: Element, added: true): void {
    if (element.hasAttribute(DocumentObserver.ATTRIBUTE)) {
      this.handleAttribute(element, DocumentObserver.ATTRIBUTE, '', !added);
    }
  }

  private handleChanges (element: Element, newValue: string, oldValue: string): void {
    this.getAttributes(oldValue, newValue).forEach((attributes: string[], index: number) => {
      const added: boolean = index === 0;

      for (const attribute of attributes) {
        this.controllers[added ? 'add' : 'remove'](attribute, element);
      }
    });
  }
}
