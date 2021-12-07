import { ActionParameters } from '../models';
import { getActionParameters, getCamelCasedName, getRawValue } from '../helpers';
import { Context } from '../controller/context';
import { Observer, observerOptions } from './observer';

export class ControllerObserver extends Observer {
  private readonly actionAttribute: string;
  private readonly attributePattern: RegExp;
  private readonly attributes: string[];
  private readonly targetAttribute: string;

  constructor(private readonly context: Context) {
    super(context.element);

    this.actionAttribute = `data-${context.identifier}-action`;
    this.targetAttribute = `data-${context.identifier}-target`;

    this.attributePattern = new RegExp(`^data-${this.context.identifier}-(class|data)-([\\w+\\-_]+)$`);

    this.attributes = [this.actionAttribute, this.targetAttribute];
  }

  protected getOptions(): MutationObserverInit {
    return Object.assign({}, observerOptions);
  }

  protected handleAttribute(element: Element, name: string, value: string, removedElement?: boolean): void {
    let property = '';
    let type = 0;

    if (element === this.context.element && this.attributes.indexOf(name) === -1) {
      const matches: string[] | null = name.match(this.attributePattern);

      if (matches == null || matches.length === 0) {
        return;
      }

      property = getCamelCasedName(matches[2]);
      type = matches[1] === 'class' ? 1 : 2;
    }

    let newValue: string = element.getAttribute(name) || '';

    if (newValue === value) {
      return;
    }

    if (removedElement === true) {
      value = newValue;
      newValue = '';
    }

    if (type === 1) {
      this.context.store.classes.set(property, newValue);

      return;
    }

    if (type === 2) {
      if (this.context.store.data.skip[property] == null) {
        this.context.store.data.skip[property] = 0;
        this.context.controller.data[property] = getRawValue(newValue);

        return;
      }

      delete this.context.store.data.skip[property];

      return;
    }

    const callback: (element: Element, value: string, added: boolean) => void = name === this.actionAttribute
      ? this.handleAction
      : this.handleTarget;

    this.handleChanges(element, value, newValue, callback);
  }

  protected handleElement(element: Element, added: boolean): void {
    for (let index = 0; index < element.attributes.length; index += 1) {
      const attribute: string = element.attributes[index].name;

      if (this.attributes.indexOf(attribute) > -1
          || (element === this.context.element && this.attributePattern.test(attribute))) {
        this.handleAttribute(element, attribute, '', !added);
      }
    }
  }

  private handleAction(element: Element, action: string, added: boolean): void {
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

  private handleChanges(
    element: Element,
    oldValue: string,
    newValue: string,
    callback: (element: Element, value: string, added: boolean) => void,
  ): void {
    const allAttributes: string[][] = this.getAttributes(oldValue, newValue);

    for (const attributes of allAttributes) {
      const added: boolean = allAttributes.indexOf(attributes) === 0;

      for (const attribute of attributes) {
        callback.call(this, element, attribute, added);
      }
    }
  }

  private handleTarget(element: Element, target: string, added: boolean): void {
    if (added) {
      this.context.store.targets.add(target, element);
    } else {
      this.context.store.targets.remove(target, element);
    }
  }
}
