import { Controller } from '../controller';
import { Observer } from './observer';

export class ControllerObserver extends Observer {
  private readonly attributeAction: string;
  private readonly attributeTarget: string;
  private readonly controller: Controller;

  constructor (controller: Controller) {
    super(controller.element);

    this.attributeAction = `data-${controller.identifier}-action`;
    this.attributeTarget = `data-${controller.identifier}-target`;

    this.controller = controller;
  }

  protected getOptions (): MutationObserverInit {
    const options: MutationObserverInit = Object.assign({}, Observer.MUTATION_OBSERVER_OPTIONS);

    options.attributeFilter = [
      this.attributeAction,
      this.attributeTarget,
    ];

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

    const callback: Function = attributeName === this.attributeAction
      ? this.handleAction
      : this.handleTarget;

    this.handleChanges(element, oldValue, newValue, callback);
  }

  protected handleElement (element: HTMLElement, added: true): void {
    [this.attributeAction, this.attributeTarget].forEach((attribute: string) => {
      this.handleAttribute(element, attribute, '', !added);
    });
  }

  private handleAction (element: HTMLElement, action: string, added: true): void {
    if (this.controller.context.store.actions.has(action)) {
      this.controller.context.store.actions[added ? 'add' : 'remove'](action, element);

      return;
    }

    if (!added) {
      return;
    }

    const parts: string[] = action.split(':');

    if (parts.length < 2) {
      return;
    }

    const callback: Function|undefined = (this.controller as any)[parts[1]];

    if (typeof callback === 'function') {
      this.controller.context.store.actions.create(action, parts[0], callback.bind(this.controller));

      this.controller.context.store.actions.add(action, element);
    }
  }

  private handleChanges (element: HTMLElement, oldValue: string, newValue: string, callback: Function): void {
    this.getAttributes(oldValue, newValue).forEach((attributes: string[], index: number) => {
      const added: boolean = index === 0;

      for (const attribute of attributes) {
        callback.call(this, element, attribute, added);
      }
    });
  }

  private handleTarget (element: HTMLElement, target: string, added: boolean): void {
    this.controller.context.store.targets[added ? 'add' : 'remove'](target, element);
  }
}
