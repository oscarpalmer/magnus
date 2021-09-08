const actionOptions: string[] = ['capture', 'once', 'passive'];
const actionPattern = /^(?:(\w+)@)?(\w+)(?::([\w:]+))?$/;

const defaultEventTypes: { [key: string]: string; } = {
  a: 'click',
  button: 'click',
  form: 'submit',
  select: 'change',
  textarea: 'input',
};

function getDefaultEventType(element: Element): string | undefined {
  const tagName: string = element.tagName.toLowerCase();

  if (tagName === 'input') {
    return element.getAttribute('type') === 'submit'
      ? 'click'
      : 'input';
  }

  if (tagName in defaultEventTypes) {
    return defaultEventTypes[tagName];
  }
}

export function getActionParameters(element: Element, action: string): ActionParameters | undefined {
  const matches: RegExpMatchArray | null = action.match(actionPattern);

  if (matches == null || matches.length === 0) {
    return;
  }

  const parameters: ActionParameters = {
    action,
    name: matches[2],
    options: matches[3],
    type: matches[1],
  };

  if (parameters.type == null) {
    const type: string | undefined = getDefaultEventType(element);

    if (type == null) {
      return;
    }

    parameters.type = type;
  }

  return parameters;
}

export interface ActionParameters {
  action: string;
  name: string;
  options?: string;
  type: string;
}

export interface ActionOptions {
  capture: boolean;
  once: boolean;
  passive: boolean;
}

export interface Action {
  callback: (event: Event) => void;
  elements: Set<Element>;
  options: ActionOptions;
  type: string;
}

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
      options: this.getOptions(parameters.options || ''),
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

  private getOptions(value: string): ActionOptions {
    const options: ActionOptions = {
      capture: false,
      once: false,
      passive: false,
    };

    const parts: string[] = value.split(':');

    for (const option of actionOptions) {
      if (parts.indexOf(option) > -1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options as any)[option] = true;
      }
    }

    return options;
  } 
}
