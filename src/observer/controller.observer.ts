import {getActionParameters, getCamelCasedName, getRawValue} from '../helpers';
import {Context} from '../controller/context';
import {Observer, observerOptions} from './observer';

export class ControllerObserver extends Observer {
  private readonly actionAttribute: string;
  private readonly dataAttributePrefix: string;
  private readonly targetAttribute: string;

  constructor(private readonly context: Context) {
    super(context.element);

    this.actionAttribute = `data-${context.identifier}-action`;
    this.dataAttributePrefix = `data-${context.identifier}-data-`;
    this.targetAttribute = `data-${context.identifier}-target`;
  }

  protected getOptions(): MutationObserverInit {
    return Object.assign({}, observerOptions);
  }

  protected handleAttribute(element: Element, name: string, value: string, removed: boolean): void {
    let newValue = element.getAttribute(name) || '';

    if (newValue === value) {
      return;
    }

    if (removed) {
      value = newValue;
      newValue = '';
    }

    if (name.startsWith(this.dataAttributePrefix)) {
      this.handleData(name, newValue);

      return;
    }

    this.handleChanges(element, value, newValue, name === this.actionAttribute
      ? this.handleAction
      : this.handleTarget);
  }

  protected handleElement(element: Element, added: boolean): void {
    for (let index = 0; index < element.attributes.length; index += 1) {
      const attribute = element.attributes[index].name;

      if (attribute === this.actionAttribute || attribute === this.targetAttribute || attribute.startsWith(this.dataAttributePrefix)) {
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

    const parameters = getActionParameters(element, action);

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
    const allAttributes = this.getAttributes(oldValue, newValue);

    for (const attributes of allAttributes) {
      const added = allAttributes.indexOf(attributes) === 0;

      for (const attribute of attributes) {
        callback.call(this, element, attribute, added);
      }
    }
  }

  private handleData(name: string, value: string): void {
    let property = name.substring(this.dataAttributePrefix.length, name.length);

    if (property == null || property.length === 0) {
      return;
    }

    property = getCamelCasedName(property);

    if (this.context.store.data.skip[property] == null) {
      this.context.store.data.skip[property] = 0;
      this.context.controller.data[property] = getRawValue(value);

      return;
    }

    delete this.context.store.data.skip[property];
  }

  private handleTarget(element: Element, target: string, added: boolean): void {
    if (added) {
      this.context.store.targets.add(target, element);
    } else {
      this.context.store.targets.remove(target, element);
    }
  }
}
