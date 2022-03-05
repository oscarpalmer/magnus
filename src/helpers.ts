import {ActionOptions, ActionParameters, KeyValueStore} from './models';

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
  }, 250) as unknown as number;
}

export function getActionOptions(value: string): ActionOptions {
  const parts = value.split(':');

  return {
    capture: parts.indexOf('capture') > -1,
    once: parts.indexOf('once') > -1,
    passive: parts.indexOf('passive') > -1,
  };
}

export function getActionParameters(element: Element, action: string): ActionParameters | undefined {
  const matches = action.match(actionPattern);

  if (matches == null || matches.groups == null) {
    return;
  }

  const isGlobal = matches.groups.global != null;

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
    const type = getDefaultEventType(element);

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

export function getDataAttributeName(controller: string, property: string): string {
  return `data-${controller}-data-${getDashedName(property)}`;
}

function getDefaultEventType(element: Element): string | undefined {
  const tagName = element.tagName.toLowerCase();

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
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return `${value}`;
  }
}
