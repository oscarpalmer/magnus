import { ActionOptions, ActionParameters, KeyValueStore } from './models';

const actionOptions: string[] = ['capture', 'once', 'passive'];

const actionPattern = /^(?:(?:(?<global>document|window)->(?:(?<globalEvent>\w+)@))|(?:(?<elementEvent>\w+)@))?(?<name>\w+)(?::(?<options>[\w+:]+))?$/;
const camelCasedPattern = /([A-Z])/g;
const dashedPattern = /(?:[_-])([a-z0-9])/g;

const defaultEventTypes: { [key: string]: string; } = {
  a: 'click',
  button: 'click',
  details: 'toggle',
  form: 'submit',
  select: 'change',
  textarea: 'input',
};

export function debounce(timers: KeyValueStore<number>, name: string, callback: () => void): void {
  clearTimeout(timers[name]);

  timers[name] = setTimeout(() => {
    delete timers[name];

    callback();
  }, 250);
}

export function getActionOptions(value: string): ActionOptions {
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

export function getActionParameters(element: Element, action: string): ActionParameters | undefined {
  const matches: RegExpMatchArray|null = action.match(actionPattern);

  if (matches == null || matches.groups == null) {
    return;
  }

  const isGlobal: boolean = matches.groups.global != null;

  const parameters: ActionParameters = {
    action,
    name: matches.groups.name,
    options: matches.groups.options,
    type: isGlobal
      ? matches.groups.globalEvent
      : matches.groups.elementEvent,
  };

  if (isGlobal) {
    parameters.target = matches.groups.global === 'document'
      ? element.ownerDocument
      : window;

      if (parameters.target == null) {
        return;
      }
  }

  if (!isGlobal && parameters.type == null) {
    const type: string | undefined = getDefaultEventType(element);

    if (type == null) {
      return;
    }

    parameters.type = type;
  }

  return parameters;
}

export function getCamelCasedName(value: string): string {
  return value.replace(dashedPattern, (_, character) => character.toUpperCase());
}

export function getDashedName(value: string): string {
  return value.replace(camelCasedPattern, (_, character) => `-${character.toLowerCase()}`);
}

export function getDataAttributeName(prefix: string, property: string): string {
  return `data-${prefix}-data-${getDashedName(property)}`;
}

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

export function getRawValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

export function getStringValue(value: unknown): string {
  if (typeof value !== 'object') {
    return value as string;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return `${value}`;
  }
}
