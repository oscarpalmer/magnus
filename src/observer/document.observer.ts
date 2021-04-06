import { Controller, ControllerConstructor } from '../controller';
import { Observer } from './observer';

export class DocumentObserver extends Observer {
  private readonly controllers: Map<string, ControllerConstructor>;

  constructor (controllers: Map<string, ControllerConstructor>) {
    super('magnus', document.documentElement);

    this.controllers = controllers;
  }

  protected handleAttribute (element: HTMLElement, attributeName: string, oldValue: string): void {
    const newValue: string = element.getAttribute(attributeName) ?? '';

    if (attributeName === Observer.CONTROLLER_ATTRIBUTE && newValue !== oldValue) {
      this.handleControllerChanges(element, attributeName, newValue, oldValue);
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

  private addControllerToElement (element: HTMLElement, identifier: string): void {
    if (this.controllers.has(identifier) && (element as any)[identifier] == null) {
      const StoredController: ControllerConstructor|undefined = this.controllers.get(identifier);

      if (StoredController != null) {
        (element as any)[identifier] = new StoredController(identifier, element);
      }
    }
  }

  private handleControllerChanges (element: HTMLElement, attributeName: string, newValue: string, oldValue: string): void {
    const identifiers: string[][] = this.getAttributes(oldValue, newValue);

    for (let index = 0; index < identifiers.length; index += 1) {
      this.toggleAttributes(element, identifiers[index], index === 0);
    }
  }

  private removeControllerFromElement (element: HTMLElement, identifier: string): void {
    const controller: Controller = (element as any)[identifier];

    if (controller == null) {
      return;
    }

    // @ts-expect-error
    controller.observer.disconnect();

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (element as any)[identifier];
  }

  private toggleAttributes (element: HTMLElement, identifiers: string[], added: boolean): void {
    for (const identifier of identifiers) {
      if (added) {
        this.addControllerToElement(element, identifier);
      } else {
        this.removeControllerFromElement(element, identifier);
      }
    }
  }
}
