import { Context } from '../context';
import { Observer } from './observer';

export class ControllerObserver extends Observer {
  private readonly attributeAction: string;
  private readonly attributeTarget: string;

  constructor (private readonly context: Context) {
    super(context.element);

    this.attributeAction = `data-${context.identifier}-action`;
    this.attributeTarget = `data-${context.identifier}-target`;
  }

  protected getOptions (): MutationObserverInit {
    const options: MutationObserverInit = Object.assign({}, Observer.OPTIONS);

    options.attributeFilter = [
      this.attributeAction,
      this.attributeTarget,
    ];

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

    const callback: Function = attributeName === this.attributeAction
      ? this.handleAction
      : this.handleTarget;

    this.handleChanges(element, oldValue, newValue, callback);
  }

  protected handleElement (element: Element, added: true): void {
    [this.attributeAction, this.attributeTarget].forEach((attribute: string) => {
      this.handleAttribute(element, attribute, '', !added);
    });
  }

  private handleAction (element: Element, action: string, added: true): void {
    if (this.context.store.actions.has(action)) {
      this.context.store.actions[added ? 'add' : 'remove'](action, element);

      return;
    }

    if (!added) {
      return;
    }

    const parts: string[] = action.split(':');

    if (parts.length < 2) {
      return;
    }

    const callback: Function|undefined = (this.context.controller as any)[parts[1]];

    if (typeof callback === 'function') {
      this.context.store.actions.create(action, parts[0], callback.bind(this.context.controller));

      this.context.store.actions.add(action, element);
    }
  }

  private handleChanges (element: Element, oldValue: string, newValue: string, callback: Function): void {
    this.getAttributes(oldValue, newValue).forEach((attributes: string[], index: number) => {
      const added: boolean = index === 0;

      for (const attribute of attributes) {
        callback.call(this, element, attribute, added);
      }
    });
  }

  private handleTarget (element: Element, target: string, added: boolean): void {
    this.context.store.targets[added ? 'add' : 'remove'](target, element);
  }
}
