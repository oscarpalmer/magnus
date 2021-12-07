import { Action, ActionParameters } from '../models';
import { getActionOptions } from '../helpers';

export class ActionStore {
  private readonly actions: Map<string, Action>;

  constructor() {
    this.actions = new Map();
  }

  add(name: string, target: Element): void {
    const action: Action|undefined = this.actions.get(name);

    if (action == null) {
      return;
    }

    action.targets.add(target);

    if (action.target == null || action.targets.size === 1) {
      (action.target || target).addEventListener(action.type, action.callback, action.options);
    }
  }

  clear(): void {
    const actions: IterableIterator<Action> = this.actions.values();

    for (const action of actions) {
      if (action.target != null) {
        action.target.removeEventListener(action.type, action.callback, action.options);
      } else {
        for (const target of action.targets) {
          target.removeEventListener(action.type, action.callback, action.options);
        }
      }

      action.targets.clear();
    }
  }

  create(parameters: ActionParameters, callback: (event: Event) => void): void {
    if (this.actions.has(parameters.action)) {
      return;
    }

    this.actions.set(parameters.action, {
      callback,
      target: parameters.target,
      targets: new Set(),
      options: getActionOptions(parameters.options || ''),
      type: parameters.type,
    });
  }

  has(name: string): boolean {
    return this.actions.has(name);
  }

  remove(name: string, target: Element): void {
    const action: Action | undefined = this.actions.get(name);

    if (action == null) {
      return;
    }

    action.targets.delete(target);

    if (action.target == null) {
      target.removeEventListener(action.type, action.callback, action.options);
    }

    if (action.targets.size > 0) {
      return;
    }

    this.actions.delete(name);

    if (action.target != null) {
      action.target.removeEventListener(action.type, action.callback, action.options);
    }
  }
}
