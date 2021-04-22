import { ControllerStore } from '../store/controller.store';
import { Observer } from './observer';

export class DocumentObserver extends Observer {
  private static readonly CONTROLLER_ATTRIBUTE: string = 'data-controller';

  private readonly store: ControllerStore;

  constructor (store: ControllerStore) {
    super(document.documentElement);

    this.store = store;
  }

  protected getOptions (): MutationObserverInit {
    const options: MutationObserverInit = Object.assign({}, Observer.MUTATION_OBSERVER_OPTIONS);

    options.attributeFilter = [DocumentObserver.CONTROLLER_ATTRIBUTE];

    return options;
  }

  protected handleAttribute (element: HTMLElement, attributeName: string, oldValue: string, removedElement?: boolean): void {
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

  protected handleElement (element: HTMLElement, added: true): void {
    if (element.hasAttribute(DocumentObserver.CONTROLLER_ATTRIBUTE)) {
      this.handleAttribute(element, DocumentObserver.CONTROLLER_ATTRIBUTE, '', !added);
    }
  }

  private handleChanges (element: HTMLElement, newValue: string, oldValue: string): void {
    this.getAttributes(oldValue, newValue).forEach((attributes: string[], index: number) => {
      const added: boolean = index === 0;

      for (const attribute of attributes) {
        this.store[added ? 'add' : 'remove'](attribute, element);
      }
    });
  }
}
