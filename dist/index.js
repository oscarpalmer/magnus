// node_modules/@oscarpalmer/atoms/dist/js/string/index.mjs
function getString(value2) {
  if (typeof value2 === "string") {
    return value2;
  }
  if (typeof value2 !== "object" || value2 == null) {
    return String(value2);
  }
  const valueOff = value2.valueOf?.() ?? value2;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value2) : asString;
}
function parse(value2, reviver) {
  try {
    return JSON.parse(value2, reviver);
  } catch {
  }
}
function words(value2) {
  return value2.match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) ?? [];
}

// node_modules/@oscarpalmer/atoms/dist/js/string/case.mjs
function camelCase(value) {
  return toCase(value, "", true, false);
}
function capitalise(value) {
  if (value.length === 0) {
    return value;
  }
  return value.length === 1 ? value.toLocaleUpperCase() : `${value.charAt(0).toLocaleUpperCase()}${value.slice(1).toLocaleLowerCase()}`;
}
function kebabCase(value) {
  return toCase(value, "-", false, false);
}
function toCase(value, delimiter, capitaliseAny, capitaliseFirst) {
  return words(value).map((word, index) => {
    const parts = word.replace(/(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu, (full, one, two, three) => three === "s" ? full : `${one}-${two}${three}`).replace(/(\p{Ll})(\p{Lu})/gu, "$1-$2").split("-");
    return parts.filter((part) => part.length > 0).map((part, partIndex) => !capitaliseAny || partIndex === 0 && index === 0 && !capitaliseFirst ? part.toLocaleLowerCase() : capitalise(part)).join(delimiter);
  }).join(delimiter);
}
// node_modules/@oscarpalmer/atoms/dist/js/is.mjs
function isArrayOrPlainObject(value2) {
  return Array.isArray(value2) || isPlainObject(value2);
}
function isNullableOrWhitespace(value2) {
  return value2 == null || /^\s*$/.test(getString(value2));
}
function isPlainObject(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value2);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value2) && !(Symbol.iterator in value2);
}

// src/helpers/event.ts
function getEventParameters(element, action, isParent) {
  const results = (isParent ? extendedActionAttributePattern : actionAttributePattern).exec(action);
  if (results != null) {
    const matches = getMatches(results, isParent);
    const parameters = {
      callback: matches.callback,
      options: getOptions(matches.options ?? ""),
      type: matches.event ?? getType(element)
    };
    if (typeof matches.name === "string") {
      parameters.external = {
        name: matches.name,
        id: matches.id
      };
    }
    return parameters.type == null ? undefined : parameters;
  }
}
function getMatches(matches, isParent) {
  return {
    callback: matches[isParent ? 6 : 4],
    event: matches[isParent ? 3 : 1],
    id: matches[isParent ? 2 : -1],
    name: matches[isParent ? 1 : -1],
    options: matches[isParent ? 7 : 5]
  };
}
function getOptions(options) {
  const items = options.toLowerCase().split(":");
  return {
    capture: items.includes("capture") || items.includes("c"),
    once: items.includes("once") || items.includes("o"),
    passive: !items.includes("active") && !items.includes("a")
  };
}
function getType(element) {
  return element instanceof HTMLInputElement ? element.type === "submit" ? "submit" : "input" : defaultEvents[element.tagName];
}

// node_modules/@oscarpalmer/toretto/dist/find.mjs
function calculateDistance(origin, target) {
  if (origin === target || origin.parentElement === target) {
    return 0;
  }
  const comparison = origin.compareDocumentPosition(target);
  const children = [...origin.parentElement?.children ?? []];
  switch (true) {
    case children.includes(target):
      return Math.abs(children.indexOf(origin) - children.indexOf(target));
    case !!(comparison & 2 || comparison & 8):
      return traverse(origin, target);
    case !!(comparison & 4 || comparison & 16):
      return traverse(target, origin);
    default:
      return -1;
  }
}
function findRelatives(origin, selector, context) {
  if (origin.matches(selector)) {
    return [origin];
  }
  const elements = [...(context ?? document).querySelectorAll(selector)];
  const { length } = elements;
  if (length === 0) {
    return [];
  }
  const distances = [];
  let minimum = null;
  for (let index = 0;index < length; index += 1) {
    const element = elements[index];
    const distance = calculateDistance(origin, element);
    if (distance < 0) {
      continue;
    }
    if (minimum == null || distance < minimum) {
      minimum = distance;
    }
    distances.push({
      distance,
      element
    });
  }
  return minimum == null ? [] : distances.filter((found) => found.distance === minimum).map((found) => found.element);
}
function traverse(from, to) {
  const children = [...to.children];
  if (children.includes(from)) {
    return children.indexOf(from) + 1;
  }
  let current = from;
  let distance = 0;
  let parent = from.parentElement;
  while (parent != null) {
    if (parent === to) {
      return distance + 1;
    }
    const children2 = [...parent.children ?? []];
    if (children2.includes(to)) {
      return distance + Math.abs(children2.indexOf(current) - children2.indexOf(to));
    }
    const index = children2.findIndex((child) => child.contains(to));
    if (index > -1) {
      return distance + Math.abs(index - children2.indexOf(current)) + traverse(to, children2[index]);
    }
    current = parent;
    distance += 1;
    parent = parent.parentElement;
  }
  return -1e6;
}

// src/helpers/attribute.ts
function parseActionAttribute(attribute) {
  const matches = extendedActionAttributePattern.exec(attribute);
  if (matches != null) {
    const [, , , , name, id, method] = matches;
    return {
      id: name == null ? undefined : id,
      name: name == null ? id : name,
      value: camelCase(method)
    };
  }
}
function parseAttribute(type, value2) {
  switch (type) {
    case "action":
      return parseActionAttribute(value2);
    case "input":
    case "output":
      return parseInputAndOutputAttribute(value2);
    default:
      return parseTargetAttribute(value2);
  }
}
function parseInputAndOutputAttribute(attribute) {
  const matches = inputAndOutputAttributePattern.exec(attribute);
  if (matches != null) {
    const [, name, id, value2, json] = matches;
    if (value2 == null && json == null) {
      return;
    }
    return {
      id,
      name,
      value: `${value2 ?? "$"}${json ?? ""}`
    };
  }
}
function parseTargetAttribute(attribute) {
  const matches = targetAttributePattern.exec(attribute);
  if (matches != null) {
    const [, name, id, value2] = matches;
    return {
      id,
      name,
      value: value2
    };
  }
}

// src/observer/attributes/target.attribute.ts
function handleTargetAttribute(type, element, value2, added) {
  const callback = attributeCallbacks[type];
  const parsed = parseAttribute(type, value2);
  let count2 = 0;
  function step() {
    if (parsed == null || count2 >= 10) {
      return;
    }
    const context = controllers.find(element, parsed.name, parsed.id);
    if (context == null) {
      count2 += 1;
      requestAnimationFrame(step);
    } else {
      callback?.(context, element, type === "action" ? value2 : parsed.value, added);
    }
  }
  step();
}
function handleTargetElement(context, element, value2, added) {
  if (added) {
    context.targets.add(value2, element);
  } else {
    context.targets.remove(value2, element);
  }
}

// src/observer/attributes/changes.attribute.ts
function getAttribute(type, element) {
  const attribute2 = element.getAttribute(`data-${type}`) ?? "";
  return strictTypes.has(type) ? attribute2.split(/\s+/g).find((part) => inputAndOutputAttributePattern.test(part)) : attribute2;
}
function getChanges(from, to) {
  const fromValues = getParts(from);
  const toValues = getParts(to);
  const attributes = [[], []];
  for (let outer = 0;outer < 2; outer += 1) {
    const values = outer === 0 ? fromValues : toValues;
    const other = outer === 1 ? fromValues : toValues;
    const { length } = values;
    for (let inner = 0;inner < length; inner += 1) {
      const value2 = values[inner];
      if (!other.includes(value2)) {
        attributes[outer].push(value2);
      }
    }
  }
  return attributes;
}
function getParts(value2) {
  return value2.split(/\s+/).map((part) => part.trim()).filter((part) => part.length > 0);
}
function handleAttributeChanges(type, parameters, initial) {
  const from = initial ? "" : parameters.value;
  const to = initial ? parameters.value : getAttribute(type, parameters.element);
  if (to == null || from === to) {
    return;
  }
  handleChanges(type, {
    from,
    to,
    element: parameters.element,
    handler: parameters.handler,
    name: `data-${type}`
  });
}
function handleChanges(type, parameters) {
  const changes = getChanges(parameters.from, parameters.to);
  const changesLength = changes.length;
  for (let changesIndex = 0;changesIndex < changesLength; changesIndex += 1) {
    const changed = changes[changesIndex];
    const added = changes.indexOf(changed) === 1;
    const changedLength = changed.length;
    for (let changedIndex = 0;changedIndex < changedLength; changedIndex += 1) {
      if (parameters.handler == null) {
        handleTargetAttribute(type, parameters.element, changed[changedIndex], added);
      } else {
        parameters.handler(parameters.element, changed[changedIndex], added);
      }
    }
  }
}

// src/observer/attributes/index.ts
function handleControllerAttribute(element, value2, added) {
  if (added) {
    controllers.add(value2, element);
  } else {
    controllers.remove(value2, element);
  }
}
function handleAttributes(context) {
  const name = context.name.toLowerCase();
  const prefix = `data-${name}-`;
  const attributes = [...context.element.attributes].filter((attribute2) => attribute2.name.startsWith(prefix));
  const { length } = attributes;
  for (let index = 0;index < length; index += 1) {
    const attribute2 = attributes[index];
    setValueFromAttribute(context, attribute2.name.slice(prefix.length), attribute2.value);
  }
  for (let typeIndex = 0;typeIndex < attributeTypesLength; typeIndex += 1) {
    const type = attributeTypes[typeIndex];
    const elements = document.querySelectorAll(`[data-${type}*="${name}"]`);
    const { length: length2 } = elements;
    for (let elementIndex = 0;elementIndex < length2; elementIndex += 1) {
      const element = elements[elementIndex];
      const value2 = element.getAttribute(`data-${type}`);
      if (value2 != null) {
        handleAttributeChanges(type, {
          element,
          value: value2,
          handler: undefined
        }, true);
      }
    }
  }
}

// src/observer/index.ts
function createObserver(element, options, handler) {
  const instance = new Observer(element, options, handler);
  if (element.ownerDocument.readyState === "complete") {
    instance.start();
  } else {
    element.ownerDocument.addEventListener("DOMContentLoaded", () => {
      instance.start();
    });
  }
  return instance;
}
function handleElement(element, handler) {
  const attributes = [...element.attributes];
  const { length } = attributes;
  for (let index = 0;index < length; index += 1) {
    handler(element, attributes[index].name, "");
  }
}
function handleNodes(nodes, handler) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (node instanceof Element) {
      handleElement(node, handler);
      handleNodes(node.childNodes, handler);
    }
  }
}

class Observer {
  element;
  options;
  handler;
  frame;
  observer;
  running = false;
  constructor(element, options, handler) {
    this.element = element;
    this.options = options;
    this.handler = handler;
    this.observer = new MutationObserver((entries) => {
      const { length } = entries;
      for (let index = 0;index < length; index += 1) {
        const entry = entries[index];
        if (entry.type === "childList") {
          handleNodes(entry.addedNodes, handler);
          handleNodes(entry.removedNodes, handler);
        } else if (entry.type === "attributes" && entry.target instanceof Element) {
          handler(entry.target, entry.attributeName ?? "", entry.oldValue ?? "");
        }
      }
    });
  }
  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.observer.observe(this.element, this.options);
    this.update();
  }
  stop() {
    if (!this.running) {
      return;
    }
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
  }
  update() {
    if (!this.running) {
      return;
    }
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      handleNodes([this.element], this.handler);
    });
  }
}

// src/observer/controller.observer.ts
function observeController(name, element) {
  const prefix = `data-${name}-`;
  let context;
  return createObserver(element, {
    attributeOldValue: true,
    attributes: true
  }, (element2, attribute2) => {
    if (attribute2.startsWith(prefix)) {
      context ??= controllers.find(element2, name);
      if (context != null) {
        setValueFromAttribute(context, attribute2.slice(prefix.length), element2.getAttribute(attribute2) ?? "");
      }
    }
  });
}

// src/store/action.store.ts
class Action {
  callback;
  options;
  targets = new Set;
  type;
  constructor(parameters) {
    this.callback = parameters.callback;
    this.options = parameters.options;
    this.type = parameters.type;
  }
}

class Actions {
  store = new Map;
  add(name, target2) {
    const action = this.store.get(name);
    if (action != null && !action.targets.has(target2)) {
      action.targets.add(target2);
      target2.addEventListener(action.type, action.callback, action.options);
    }
  }
  clear() {
    const actions = [...this.store.values()];
    const actionsLength = actions.length;
    for (let actionIndex = 0;actionIndex < actionsLength; actionIndex += 1) {
      const action = actions[actionIndex];
      const targets = [...action.targets];
      const targetsLength = targets.length;
      for (let targetIndex = 0;targetIndex < targetsLength; targetIndex += 1) {
        targets[targetIndex].removeEventListener(action.type, action.callback, action.options);
      }
      action.targets.clear();
    }
    this.store.clear();
  }
  create(parameters) {
    if (!this.store.has(parameters.name)) {
      this.store.set(parameters.name, new Action(parameters));
    }
  }
  has(name) {
    return this.store.has(name);
  }
  remove(name, target2) {
    const action = this.store.get(name);
    if (action != null) {
      target2.removeEventListener(action.type, action.callback);
      action.targets.delete(target2);
      if (action.targets.size === 0) {
        this.store.delete(name);
      }
    }
  }
}

// src/store/target.store.ts
class Targets {
  context;
  callbacks;
  store = new Map;
  get readonly() {
    return this.callbacks;
  }
  constructor(context) {
    this.context = context;
    this.callbacks = Object.create({
      find: this.find.bind(this),
      get: this.get.bind(this),
      getAll: this.getAll.bind(this),
      has: this.has.bind(this)
    });
  }
  add(name, element) {
    let targets = this.store.get(name);
    if (targets == null) {
      targets = new Set;
      this.store.set(name, targets);
    }
    targets.add(element);
  }
  clear() {
    const targets = [...this.store.values()];
    const { length } = targets;
    for (let index = 0;index < length; index += 1) {
      targets[index].clear();
    }
    this.store.clear();
  }
  find(selector) {
    return [...this.context.element.querySelectorAll(selector)];
  }
  get(name) {
    return this.getAll(name)[0];
  }
  getAll(name) {
    return [...this.store.get(name) ?? []];
  }
  has(name) {
    return (this.store.get(name)?.size ?? 0) > 0;
  }
  remove(name, element) {
    this.store.get(name)?.delete(element);
  }
}

// node_modules/@oscarpalmer/atoms/dist/js/function.mjs
function noop() {
}
// node_modules/@oscarpalmer/toretto/node_modules/@oscarpalmer/atoms/dist/js/is.mjs
function isPlainObject2(value3) {
  if (typeof value3 !== "object" || value3 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value3);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value3) && !(Symbol.iterator in value3);
}

// node_modules/@oscarpalmer/toretto/dist/event.mjs
function createDispatchOptions(options) {
  return {
    bubbles: getBoolean(options?.bubbles),
    cancelable: getBoolean(options?.cancelable),
    composed: getBoolean(options?.composed)
  };
}
function createEvent(type, options) {
  const hasOptions = isPlainObject2(options);
  if (hasOptions && "detail" in options) {
    return new CustomEvent(type, {
      ...createDispatchOptions(options),
      detail: options?.detail
    });
  }
  return new Event(type, createDispatchOptions(hasOptions ? options : {}));
}
function createEventOptions(options) {
  if (isPlainObject2(options)) {
    return {
      capture: getBoolean(options.capture),
      once: getBoolean(options.once),
      passive: getBoolean(options.passive, true)
    };
  }
  return {
    capture: getBoolean(options),
    once: false,
    passive: true
  };
}
function dispatch(target2, type, options) {
  target2.dispatchEvent(createEvent(type, options));
}
function getBoolean(value3, defaultValue) {
  return typeof value3 === "boolean" ? value3 : defaultValue ?? false;
}
function off(target2, type, listener, options) {
  target2.removeEventListener(type, listener, createEventOptions(options));
}
function on(target2, type, listener, options) {
  const extended = createEventOptions(options);
  target2.addEventListener(type, listener, extended);
  return () => {
    target2.removeEventListener(type, listener, extended);
  };
}

// src/controller/events.ts
function getTarget(context, target2) {
  if (typeof target2 === "string") {
    return context.targets.get(target2);
  }
  return target2 instanceof EventTarget ? target2 : context.element;
}
function handleEvent(context, parameters, add) {
  const firstIsOptions = typeof parameters.first === "boolean" || isPlainObject(parameters.first);
  const target2 = getTarget(context, firstIsOptions ? parameters.second : parameters.first);
  if (target2 == null) {
    return noop;
  }
  const options = firstIsOptions ? parameters.first : undefined;
  return (add ? on : off)(target2, parameters.type, parameters.listener, options) ?? noop;
}

class Events {
  context;
  constructor(context) {
    this.context = context;
  }
  dispatch(type, first, second) {
    const firstIsOptions = isPlainObject(first);
    const target2 = getTarget(this.context, firstIsOptions ? second : first);
    const options = firstIsOptions ? first : undefined;
    if (target2 != null) {
      dispatch(target2, type, options);
    }
  }
  off(type, listener, first, second) {
    handleEvent(this.context, { listener, type, first, second }, false);
  }
  on(type, listener, first, second) {
    return handleEvent(this.context, { listener, type, first, second }, true);
  }
}

// src/controller/context.ts
class Context {
  name;
  element;
  actions;
  controller;
  data;
  events;
  observer;
  targets;
  constructor(name, element, ctor) {
    this.name = name;
    this.element = element;
    this.actions = new Actions;
    this.data = new Data(this);
    this.events = new Events(this);
    this.observer = observeController(name, element);
    this.targets = new Targets(this);
    this.controller = new ctor(this);
    handleAttributes(this);
    this.controller.connect?.();
  }
}

// src/store/controller.store.ts
class Controllers {
  stored = new Map;
  add(name, element) {
    const controller5 = this.stored.get(name);
    if (controller5 != null && !controller5.instances.has(element)) {
      controller5.instances.set(element, new Context(name, element, controller5.ctor));
    }
  }
  create(name, ctor) {
    if (!this.stored.has(name)) {
      this.stored.set(name, new StoredController(ctor));
    }
  }
  find(origin, name, id) {
    let found;
    if (id == null) {
      found = findRelatives(origin, `[data-controller~="${name}"]`)[0];
    } else {
      found = document.querySelector(`#${id}`);
    }
    return found == null ? undefined : this.stored.get(name)?.instances.get(found);
  }
  has(name) {
    return this.stored.has(name);
  }
  remove(name, element) {
    const stored = this.stored.get(name);
    if (stored == null) {
      return;
    }
    if (element == null) {
      const instances = [...stored.instances.values()];
      const { length } = instances;
      for (let index = 0;index < length; index += 1) {
        this.removeInstance(stored, instances[index]);
      }
      stored.instances.clear();
      this.stored.delete(name);
    } else {
      this.removeInstance(stored, stored.instances.get(element));
    }
  }
  removeInstance(controller5, context2) {
    if (context2 != null) {
      context2.observer.stop();
      context2.actions.clear();
      context2.targets.clear();
      context2.controller.disconnect?.();
      controller5?.instances.delete(context2.element);
    }
  }
}

class StoredController {
  ctor;
  instances = new Map;
  constructor(ctor) {
    this.ctor = ctor;
  }
}
var controllers = new Controllers;

// src/helpers/index.ts
function findTarget(origin, name, id) {
  const noId = id == null;
  switch (true) {
    case (noId && /^document$/i.test(name)):
      return origin.ownerDocument ?? document;
    case (noId && /^window$/i.test(name)):
      return origin.ownerDocument?.defaultView ?? window;
    default:
      return controllers.find(origin, name, id)?.element ?? (noId ? origin.ownerDocument.querySelector(`#${name}`) : undefined);
  }
}

// src/observer/attributes/action.attribute.ts
function createAction(context2, element, action2, value3, custom) {
  const parameters = custom?.handler == null ? getEventParameters(element, value3, context2.element === element) : {
    callback: "",
    options: {
      capture: false,
      once: false,
      passive: true
    },
    type: action2
  };
  if (parameters == null) {
    return;
  }
  const callback = custom?.handler ?? context2.controller[parameters.callback];
  if (typeof callback !== "function") {
    return;
  }
  const target3 = parameters.external == null ? element : findTarget(element, parameters.external.name, parameters.external.id);
  if (target3 != null) {
    context2.actions.create({
      callback: callback.bind(context2.controller),
      name: value3,
      options: parameters.options,
      type: parameters.type
    });
    context2.actions.add(value3, target3);
  }
}
function handleActionAttribute(context2, element, value3, added, custom) {
  const action2 = custom?.event ?? value3;
  if (context2.actions.has(value3)) {
    if (added) {
      context2.actions.add(value3, element);
    } else {
      context2.actions.remove(value3, element);
    }
    return;
  }
  if (added) {
    createAction(context2, element, action2, value3, custom);
  }
}

// src/observer/attributes/input-output.attribute.ts
function getDataType(element) {
  switch (true) {
    case (element instanceof HTMLInputElement && !ignoredInputTypes.has(element.type)):
      return element.type === "checkbox" ? "boolean" : parseableInputTypes.has(element.type) ? "parseable" : "string";
    case element instanceof HTMLSelectElement:
      return "parseable";
    case element instanceof HTMLTextAreaElement:
      return "string";
    default:
      return;
  }
}
function getEventType(element) {
  if (element instanceof HTMLInputElement && changeEventTypes.has(element.type) || element instanceof HTMLSelectElement) {
    return "change";
  }
  return "input";
}
function handleInputAttribute(context2, element, value3, added) {
  const [key, json] = value3.split(":");
  const data5 = getDataType(element);
  if (context2 != null && data5 != null) {
    const name = `input:${value3}`;
    const event3 = getEventType(element);
    handleActionAttribute(context2, element, name, added, {
      event: event3,
      handler: (event4) => {
        setDataValue(data5, context2, event4.target, key, json != null);
      }
    });
    handleTargetElement(context2, element, name, added);
  }
}
function handleOutputAttribute(context2, element, value3, added) {
  handleTargetElement(context2, element, `output:${value3}`, added);
}
function setDataValue(type, context2, element, name, json) {
  let actual;
  if (json) {
    actual = parse(element.value);
    if (name === "$" && element.value.trim().length > 0 && actual != null) {
      replaceData(context2, actual);
    }
    if (actual == null) {
      return;
    }
  }
  context2.data.value[name] = actual ?? (type === "boolean" ? element.checked : type === "parseable" ? parse(element.value) ?? element.value : element.value);
}

// src/constants.ts
var attributeCallbacks = {
  action: handleActionAttribute,
  input: handleInputAttribute,
  output: handleOutputAttribute,
  target: handleTargetElement
};
var attributeTypes = Object.keys(attributeCallbacks);
var attributeTypesLength = attributeTypes.length;
var controllerAttribute = "data-controller";
var actionAttributePattern = /^(?:([\w-]+)->)?([\w-]+)(?:#([\w-]+))?@([\w-]+)(?::([a-z:]+))?/i;
var extendedActionAttributePattern = /^(?:(?:(?:([\w-]+)(?:#([\w-]+))?)?@)?([\w-]+)->)?([\w-]+)(?:#([\w-]+))?@([\w-]+)(?::([a-z:]+))?/i;
var inputAndOutputAttributePattern = /^([\w-]+)(?:#([\w-]+))?(?:\.([\w-]+))?(:json)?$/i;
var targetAttributePattern = /^([\w-]+)(?:#([\w-]+))?\.([\w-]+)$/;
var changeEventTypes = new Set(["checkbox", "radio"]);
var defaultEvents = {
  A: "click",
  BUTTON: "click",
  DETAILS: "toggle",
  FORM: "submit",
  SELECT: "change",
  TEXTAREA: "input"
};
var ignoredInputTypes = new Set([
  "button",
  "image",
  "submit",
  "reset"
]);
var parseableInputTypes = new Set([
  "hidden",
  "number",
  "radio",
  "range",
  "week"
]);
var strictTypes = new Set(["input", "output"]);

// src/store/data.store.ts
function replaceData(context2, value3) {
  const previous = Object.keys(context2.data.value).filter((key) => key.length > 0);
  const next = isArrayOrPlainObject(value3) ? Object.keys(value3).filter((key) => key.length > 0) : [];
  for (const key of previous) {
    if (value3 == null || !next.includes(key)) {
      delete context2.data.value[key];
    } else {
      context2.data.value[key] = next.includes(key) ? value3[key] : undefined;
    }
  }
  for (const key of next) {
    const val = value3[key];
    if (!previous.includes(key) && val != null) {
      context2.data.value[key] = value3[key];
    }
  }
}
function setAttribute(element, name, value3) {
  if (isNullableOrWhitespace(value3.original)) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value3.stringified);
  }
}
function setElementContents(elements, value3) {
  const { length } = elements;
  for (let index = 0;index < length; index += 1) {
    elements[index].textContent = value3;
  }
}
function setElementValue(element, value3) {
  if (element === document.activeElement) {
    return;
  }
  switch (true) {
    case (element instanceof HTMLInputElement && changeEventTypes.has(element.type)):
      element.checked = element.value === value3 || element.type === "checkbox" && value3 === "true";
      return;
    case ((element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) && element.value !== value3):
      element.value = value3;
      return;
    case (element instanceof HTMLSelectElement && element.value !== value3):
      element.value = [...element.options].findIndex((option) => option.value === value3) > -1 ? value3 : "";
      return;
  }
}
function setElementValues(elements, value3) {
  const { length } = elements;
  for (let index = 0;index < length; index += 1) {
    setElementValue(elements[index], value3);
  }
}
function setValue3(context2, prefix, name, value3) {
  cancelAnimationFrame(frames.get(context2));
  setAttribute(context2.element, `${prefix}${kebabCase(name)}`, value3);
  setElementValues(context2.targets.getAll(`input:${name}`), value3.stringified);
  const json = JSON.stringify(value3.original, null, +(getComputedStyle(context2.element)?.tabSize ?? "4"));
  setElementContents(context2.targets.getAll(`output:${name}`), value3.stringified);
  setElementContents(context2.targets.getAll(`output:${name}:json`), json);
  setElementValues(context2.targets.getAll(`input:${name}:json`), json);
  frames.set(context2, requestAnimationFrame(() => {
    const json2 = JSON.stringify(context2.data.value, null, +(getComputedStyle(context2.element)?.tabSize ?? "4"));
    setElementContents(context2.targets.getAll("output:$:json"), json2);
    setElementValues(context2.targets.getAll("input:$:json"), json2);
  }));
}
function setValueFromAttribute(context2, name, value3) {
  if (getString(context2.data.value[name]) !== value3) {
    context2.data.value[name] = value3 == null ? value3 : parse(value3) ?? value3;
  }
}
function updateProperty(context2, prefix, target5, property, original, stringified, frames) {
  const name = camelCase(String(property));
  if (name.trim().length === 0) {
    return true;
  }
  const result = original == null ? Reflect.deleteProperty(target5, name) : Reflect.set(target5, name, original);
  if (result) {
    cancelAnimationFrame(frames[name]);
    frames[name] = requestAnimationFrame(() => {
      setValue3(context2, prefix, name, {
        original,
        stringified
      });
    });
  }
  return result;
}
var frames = new WeakMap;

class Data {
  value;
  constructor(context2) {
    const frames2 = {};
    const prefix = `data-${context2.name}-`;
    this.value = new Proxy({}, {
      deleteProperty(target5, property) {
        return updateProperty(context2, prefix, target5, property, undefined, "", frames2);
      },
      get(target5, property) {
        return Reflect.get(target5, camelCase(String(property)));
      },
      set(target5, property, next) {
        const name = camelCase(String(property));
        const previous = Reflect.get(target5, name);
        const nextAsString = getString(next);
        if (getString(previous) === nextAsString) {
          return true;
        }
        return updateProperty(context2, prefix, target5, name, next, nextAsString, frames2);
      }
    });
  }
}

// src/controller/index.ts
class Controller {
  context2;
  get data() {
    return this.context.data.value;
  }
  set data(value3) {
    replaceData(this.context, value3);
  }
  get element() {
    return this.context.element;
  }
  get events() {
    return this.context.events;
  }
  get name() {
    return this.context.name;
  }
  get targets() {
    return this.context.targets.readonly;
  }
  constructor(context2) {
    this.context = context2;
  }
  connect() {
  }
  disconnect() {
  }
}

// src/observer/document.observer.ts
function observerDocument() {
  const attributes3 = [
    controllerAttribute,
    ...attributeTypes.map((type) => `data-${type}`)
  ];
  return createObserver(document.body, {
    attributeFilter: attributes3,
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  }, (element, name, value3) => {
    if (attributes3.includes(name)) {
      handleAttributeChanges(name.slice(5), {
        element,
        value: value3,
        handler: name === controllerAttribute ? handleControllerAttribute : undefined
      }, false);
    }
  });
}

// src/magnus.ts
class Magnus {
  add(name, ctor) {
    if (!controllers.has(name)) {
      controllers.create(name, ctor);
      observer.update();
    }
  }
  remove(name) {
    controllers.remove(name);
  }
  start() {
    observer.start();
  }
  stop() {
    observer.stop();
  }
}
var magnus = new Magnus;
var observer = observerDocument();
var magnus_default = magnus;
export {
  magnus_default as magnus,
  Controller
};
