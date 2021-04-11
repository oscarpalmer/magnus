import { Controller } from '../controller';
import { Observer } from './observer';

export class ControllerObserver extends Observer {
  private readonly controller: Controller;

  constructor (controller: Controller) {
    super(controller.identifier, controller.element);

    this.controller = controller;
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

    const callback: Function = attributeName === this.attributeAction
      ? this.handleAction
      : this.handleTarget;

    this.handleAttributeChanges(element, oldValue, newValue, callback);
  }

  protected handleElement (element: HTMLElement, added: true): void {
    if (element.hasAttribute(this.attributeAction)) {
      this.handleAttribute(element, this.attributeAction, '', !added);
    }

    if (element.hasAttribute(this.attributeTarget)) {
      this.handleAttribute(element, this.attributeTarget, '', !added);
    }
  }

  private handleAction (element: HTMLElement, action: string, added: true): void {
    if (this.controller.context.store.hasAction(action)) {
      if (added) {
        this.controller.context.store.addAction(action, element);
      } else {
        this.controller.context.store.removeAction(action, element);
      }

      return;
    }

    if (!added) {
      return;
    }

    const parts: string[] = action.split(':');

    if (parts.length < 2) {
      return;
    }

    const callback: any = (this.controller as any)[parts[1]];

    if (typeof callback === 'function') {
      this.controller.context.store.createAction(action, parts[0], callback.bind(this.controller));

      this.controller.context.store.addAction(action, element);
    }
  }

  private handleAttributeChanges (element: HTMLElement, oldValue: string, newValue: string, callback: Function): void {
    const attributes: string[][] = this.getAttributes(oldValue, newValue);

    for (let index = 0; index < attributes.length; index += 1) {
      this.toggleAttributes(element, attributes[index], callback, index === 0);
    }
  }

  private handleTarget (element: HTMLElement, target: string, added: boolean): void {
    if (added) {
      this.controller.context.store.addTarget(target, element);
    } else {
      this.controller.context.store.removeTarget(target, element);
    }
  }

  private toggleAttributes (element: HTMLElement, attributes: string[], callback: Function, added: boolean): void {
    for (const attribute of attributes) {
      callback.call(this, element, attribute, added);
    }
  }
}
