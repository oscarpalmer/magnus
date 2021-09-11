import { Action, ActionParameters } from '../models';
import { getActionOptions } from '../helpers';

export class ActionStore {
  private readonly actions: Map<string, Action>;

  constructor() {
    this.actions = new Map();
  }

  add(name: string, element: Element): void {
    const action: Action | undefined = this.actions.get(name);

    if (action == null) {
      return;
    }

    action.elements.add(element);

    element.addEventListener(action.type, action.callback, action.options);
  }

  clear(): void {
    const actions: IterableIterator<Action> = this.actions.values();

    for (const action of actions) {
      for (const element of action.elements) {
        element.removeEventListener(action.type, action.callback, action.options);
      }

      action.elements.clear();
    }
  }

  create(parameters: ActionParameters, callback: (event: Event) => void): void {
    if (this.actions.has(parameters.action)) {
      return;
    }

    this.actions.set(parameters.action, {
      callback,
      elements: new Set(),
      options: getActionOptions(parameters.options || ''),
      type: parameters.type,
    });
  }

  has(name: string): boolean {
    return this.actions.has(name);
  }

  remove(name: string, element: Element): void {
    const action: Action | undefined = this.actions.get(name);

    if (action == null) {
      return;
    }

    action.elements.delete(element);

    element.removeEventListener(action.type, action.callback, action.options);

    if (action.elements.size === 0) {
      this.actions.delete(name);
    }
  }
}
