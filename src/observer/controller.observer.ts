import { ActionParameters, getActionParameters } from '../store/action.store';
import { Context } from '../context';
import { Observer, observerOptions } from './observer';



export class ControllerObserver extends Observer {
  private readonly actionAttribute: string;
  private readonly targetAttribute: string;

  constructor(private readonly context: Context) {
    super(context.element);

    this.actionAttribute = `data-${context.identifier}-action`;
    this.targetAttribute = `data-${context.identifier}-target`;
  }

  protected getOptions(): MutationObserverInit {
    const options: MutationObserverInit = Object.assign({}, observerOptions);

    options.attributeFilter = [
      this.actionAttribute,
      this.targetAttribute,
    ];

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback: any = attributeName === this.actionAttribute
      ? this.handleAction
      : this.handleTarget;

    this.handleChanges(element, oldValue, newValue, callback);
  }

  protected handleElement(element: Element, added: true): void {
    [this.actionAttribute, this.targetAttribute].forEach((attribute: string) => {
      this.handleAttribute(element, attribute, '', !added);
    });
  }

  private handleAction(element: Element, action: string, added: true): void {
    if (this.context.store.actions.has(action)) {
      if (added) {
        this.context.store.actions.add(action, element);
      } else {
        this.context.store.actions.remove(action, element);
      }

      return;
    }

    if (!added) {
      return;
    }

    const parameters: ActionParameters | undefined = getActionParameters(element, action);

    if (parameters == null) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback: (event: Event) => void = (this.context.controller as any)[parameters.name];

    if (typeof callback !== 'function') {
      return;
    }

    this.context.store.actions.create(parameters, callback.bind(this.context.controller));

    this.context.store.actions.add(action, element);
  }

  private handleChanges(element: Element, oldValue: string, newValue: string, callback: (...args: unknown[]) => void): void {
    this.getAttributes(oldValue, newValue).forEach((attributes: string[], index: number) => {
      const added: boolean = index === 0;

      for (const attribute of attributes) {
        callback.call(this, element, attribute, added);
      }
    });
  }

  private handleTarget(element: Element, target: string, added: boolean): void {
    if (added) {
      this.context.store.targets.add(target, element);
    } else {
      this.context.store.targets.remove(target, element);
    }
  }
}
