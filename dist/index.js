// src/controller/index.ts
class Controller {
  context;
  get element() {
    return this.context.element;
  }
  get data() {
    return this.context.data.value;
  }
  get name() {
    return this.context.name;
  }
  constructor(context) {
    this.context = context;
  }
}

// node_modules/@oscarpalmer/atoms/dist/js/element/closest.mjs
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
function closest(origin, selector, context) {
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
// node_modules/@oscarpalmer/atoms/dist/js/is.mjs
function isNullableOrWhitespace(value2) {
  return value2 == null || /^\s*$/.test(getString(value2));
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
function handleElement(element, added, handler) {
  const attributes = [...element.attributes];
  const { length } = attributes;
  for (let index = 0;index < length; index += 1) {
    handler(element, attributes[index].name, "", added);
  }
}
function handleNodes(nodes, added, handler) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (node instanceof Element) {
      handleElement(node, added, handler);
      handleNodes(node.childNodes, added, handler);
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
          handleNodes(entry.addedNodes, true, handler);
          handleNodes(entry.removedNodes, false, handler);
        } else if (entry.type === "attributes" && entry.target instanceof Element) {
          handler(entry.target, entry.attributeName ?? "", entry.oldValue ?? "", true);
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
      handleNodes([this.element], true, this.handler);
    });
  }
}

// src/observer/controller.observer.ts
function observeController(name, element) {
  const prefix = `data-${name}-`;
  let context;
  return createObserver(element, {
    attributes: true
  }, (element2, attribute) => {
    if (attribute.startsWith(prefix)) {
      context ??= findContext(element2, name);
      const property = attribute.slice(prefix.length);
      if (context != null) {
        const previous = context.data.value[property];
        const next = element2.getAttribute(attribute) ?? "";
        if (!Object.is(previous, next)) {
          context.data.value[property] = next;
        }
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
  add(name, target) {
    const action = this.store.get(name);
    if (action != null && !action.targets.has(target)) {
      action.targets.add(target);
      target.addEventListener(action.type, action.callback, action.options);
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
  remove(name, target) {
    const action = this.store.get(name);
    if (action != null) {
      target.removeEventListener(action.type, action.callback);
      action.targets.delete(target);
      if (action.targets.size === 0) {
        this.store.delete(name);
      }
    }
  }
}

// src/store/data.store.ts
function setValue2(context, prefix, name, original, stringified) {
  const { element } = context;
  if (isNullableOrWhitespace(original)) {
    element.removeAttribute(`${prefix}${name}`);
  } else {
    element.setAttribute(`${prefix}${name}`, stringified);
  }
  const inputs = context.targets.get(`input:${name}`);
  let index = 0;
  let length = inputs.length;
  for (;index < length; index += 1) {
    const input = inputs[index];
    if ((input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) && input.value !== stringified) {
      input.value = stringified;
    } else if (input instanceof HTMLSelectElement && input.value !== stringified) {
      if (Array.from(input.options).findIndex((option) => option.value === stringified) > -1) {
        input.value = stringified;
      }
    }
  }
  const outputs = context.targets.get(`output:${name}`);
  length = outputs.length;
  for (index = 0;index < length; index += 1) {
    outputs[index].textContent = stringified;
  }
}

class Data {
  value;
  constructor(context) {
    const frames = {};
    const prefix = `data-${context.name}-`;
    this.value = new Proxy({}, {
      set(target, property, value2) {
        const previous = getString(Reflect.get(target, property));
        const next = getString(value2);
        if (Object.is(previous, next)) {
          return true;
        }
        const result = Reflect.set(target, property, value2);
        if (result) {
          const name = String(property);
          cancelAnimationFrame(frames[name]);
          frames[name] = requestAnimationFrame(() => {
            setValue2(context, prefix, name, value2, next);
          });
        }
        return result;
      }
    });
  }
}

// src/store/target.store.ts
class Targets {
  store = new Map;
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
  get(name) {
    return [...this.store.get(name) ?? []];
  }
  remove(name, element) {
    this.store.get(name)?.delete(element);
  }
}

// src/controller/context.ts
class Context {
  name;
  element;
  actions;
  controller;
  data;
  observer;
  targets;
  constructor(name, element, ctor) {
    this.name = name;
    this.element = element;
    this.actions = new Actions;
    this.data = new Data(this);
    this.observer = observeController(name, element);
    this.targets = new Targets;
    this.controller = new ctor(this);
    handleAttributes(this);
    this.controller.connected?.();
  }
}

// src/store/controller.store.ts
function addController(name, element2) {
  const controller3 = controllers.get(name);
  if (controller3 != null && !controller3.instances.has(element2)) {
    controller3.instances.set(element2, new Context(name, element2, controller3.ctor));
  }
}
function createController(name, ctor) {
  if (!controllers.has(name)) {
    controllers.set(name, new StoredController(ctor));
  }
}
function findContext(origin, name, id) {
  let found;
  if (id == null) {
    found = closest(origin, `[data-controller*="${name}"]`)[0];
  } else {
    found = document.querySelector(`#${id}`);
  }
  return found == null ? undefined : controllers.get(name)?.instances.get(found);
}
function removeController(name, element2) {
  const stored = controllers.get(name);
  if (stored == null) {
    return;
  }
  if (element2 == null) {
    const instances = [...stored.instances.values()];
    const { length } = instances;
    for (let index = 0;index < length; index += 1) {
      removeInstance(stored, instances[index]);
    }
  } else {
    removeInstance(stored, stored.instances.get(element2));
  }
}
function removeInstance(controller3, context2) {
  if (context2 != null) {
    context2.observer.stop();
    context2.actions.clear();
    context2.targets.clear();
    context2.controller.disconnected?.();
    controller3?.instances.delete(context2.element);
  }
}

class StoredController {
  ctor;
  instances = new Map;
  constructor(ctor) {
    this.ctor = ctor;
  }
}
var controllers = new Map;

// src/helpers/element.ts
function findTarget(origin, name, id) {
  const noId = id == null;
  switch (true) {
    case (noId && /^document$/i.test(name)):
      return document;
    case (noId && /^window$/i.test(name)):
      return window;
    default:
      return findContext(origin, name, id)?.element ?? (noId ? origin.ownerDocument.querySelector(`#${id}`) : undefined);
  }
}

// src/helpers/attribute.ts
function parseActionAttribute(attribute) {
  const matches = extendedActionAttributePattern.exec(attribute);
  if (matches != null) {
    const [, , , , name, id, method] = matches;
    return {
      id: name == null ? undefined : id,
      name: name == null ? id : name,
      value: method
    };
  }
}
function parseAttribute(type, value2) {
  return type === "action" ? parseActionAttribute(value2) : parseTargetAttribute(value2);
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
var actionAttributePattern = /^(?:(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;
var extendedActionAttributePattern = /^(?:(?:(?:(\w+)(?:#(\w+))?)?@)?(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;
var targetAttributePattern = /^(\w+)(?:#(\w+))?\.(\w+)$/i;

// src/helpers/event.ts
function getEventParameters(element2, action2, isParent) {
  const results = (isParent ? extendedActionAttributePattern : actionAttributePattern).exec(action2);
  if (results != null) {
    const matches = getMatches(results, isParent);
    const parameters = {
      callback: matches.callback,
      options: getOptions(matches.options ?? ""),
      type: matches.event ?? getType(element2)
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
function getType(element2) {
  return element2 instanceof HTMLInputElement ? element2.type === "submit" ? "submit" : "input" : defaultEvents[element2.tagName];
}
var defaultEvents = {
  A: "click",
  BUTTON: "click",
  DETAILS: "toggle",
  FORM: "submit",
  SELECT: "change",
  TEXTAREA: "input"
};

// src/observer/attributes/target.attribute.ts
function handleTarget(type, element2, value2, added, callback) {
  const parsed = parseAttribute(type, value2);
  if (parsed == null) {
    return;
  }
  const context2 = findContext(element2, parsed.name, parsed.id);
  if (context2 != null) {
    callback(context2, element2, type === "action" ? value2 : parsed.value, added);
  }
}
function handleTargetAttribute(element2, value2, added) {
  handleTarget("target", element2, value2, added, handleTargetElement);
}
function handleTargetElement(context2, element2, value2, added) {
  if (added) {
    context2.targets.add(value2, element2);
  } else {
    context2.targets.remove(value2, element2);
  }
}

// src/observer/attributes/action.attribute.ts
function handleAction(context2, element3, value2, added, custom) {
  const action2 = custom?.event ?? value2;
  if (context2.actions.has(value2)) {
    if (added) {
      context2.actions.add(value2, element3);
    } else {
      context2.actions.remove(value2, element3);
    }
    return;
  }
  if (!added) {
    return;
  }
  const parameters = custom?.handler == null ? getEventParameters(element3, value2, context2.element === element3) : {
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
  const target3 = parameters.external == null ? element3 : findTarget(element3, parameters.external.name, parameters.external.id);
  if (target3 != null) {
    context2.actions.create({
      callback: callback.bind(context2.controller),
      name: value2,
      options: parameters.options,
      type: parameters.type
    });
    context2.actions.add(value2, target3);
  }
}
function handleActionAttribute(element3, value2, added) {
  handleTarget("action", element3, value2, added, handleAction);
}

// src/observer/attributes/input-output.attribute.ts
function getDataType(element3) {
  switch (true) {
    case (element3 instanceof HTMLInputElement && !ignoredTypes.has(element3.type)):
      return element3.type === "checkbox" ? "boolean" : parseableTypes.has(element3.type) ? "parseable" : "string";
    case element3 instanceof HTMLSelectElement:
      return "parseable";
    case element3 instanceof HTMLTextAreaElement:
      return "string";
    default:
      return;
  }
}
function handleInputAttribute(element3, value2, added) {
  handleTarget("input", element3, value2, added, handleInput);
}
function handleOutputAttribute(element3, value2, added) {
  handleTarget("output", element3, value2, added, handleOutput);
}
function handleInput(context2, element3, value2, added) {
  const type = getDataType(element3);
  if (context2 != null && type != null) {
    const event2 = element3 instanceof HTMLSelectElement ? "change" : "input";
    const name = `input:${value2}`;
    handleAction(context2, element3, name, added, {
      event: event2,
      handler: () => {
        setDataValue(type, context2, element3, value2);
      }
    });
    handleTargetElement(context2, element3, name, added);
  }
}
function handleOutput(context2, element3, value2, added) {
  handleTargetElement(context2, element3, `output:${value2}`, added);
}
function setDataValue(type, context2, element3, name) {
  context2.data.value[name] = type === "boolean" ? element3.checked : type === "parseable" ? parse(element3.value) ?? element3.value : element3.value;
}
var ignoredTypes = new Set(["button", "image", "submit", "reset"]);
var parseableTypes = new Set(["number", "radio", "range", "week"]);

// src/observer/attributes/index.ts
function getChanges(from, to) {
  const fromValues = from.split(/\s+/).map((part) => part.trim()).filter((part) => part.length > 0);
  const toValues = to.split(/\s+/).map((part) => part.trim()).filter((part) => part.length > 0);
  const attributes2 = [[], []];
  for (let outer = 0;outer < 2; outer += 1) {
    const values = outer === 0 ? fromValues : toValues;
    const other = outer === 1 ? fromValues : toValues;
    const { length } = values;
    for (let inner = 0;inner < length; inner += 1) {
      const value2 = values[inner];
      if (!other.includes(value2)) {
        attributes2[outer].push(value2);
      }
    }
  }
  return attributes2;
}
function handleAttributeChanges(parameters, initial) {
  if (parameters.callback == null) {
    return;
  }
  let from = initial ? "" : parameters.value;
  let to = initial ? parameters.value : parameters.element.getAttribute(parameters.name) ?? "";
  if (from === to) {
    return;
  }
  if (!parameters.added) {
    [from, to] = [to, from];
  }
  handleChanges({
    from,
    to,
    callback: parameters.callback,
    element: parameters.element,
    name: parameters.name
  });
}
function handleChanges(parameters) {
  const changes = getChanges(parameters.from, parameters.to);
  const changesLength = changes.length;
  for (let changesIndex = 0;changesIndex < changesLength; changesIndex += 1) {
    const changed = changes[changesIndex];
    const added = changes.indexOf(changed) === 1;
    const changedLength = changed.length;
    for (let changedIndex = 0;changedIndex < changedLength; changedIndex += 1) {
      const change = changed[changedIndex];
      parameters.callback(parameters.element, change, added);
    }
  }
}
function handleControllerAttribute(element3, value2, added) {
  if (added) {
    addController(value2, element3);
  } else {
    removeController(value2, element3);
  }
}
function handleAttributes(context2) {
  const name = context2.name.toLowerCase();
  for (let attributeIndex = 0;attributeIndex < attributesLength; attributeIndex += 1) {
    const attribute3 = attributes2[attributeIndex];
    const callback = callbacks[attribute3];
    const elements = document.querySelectorAll(`[data-${attribute3}*="${name}"]`);
    const { length } = elements;
    for (let elementIndex = 0;elementIndex < length; elementIndex += 1) {
      const element3 = elements[elementIndex];
      const value2 = element3.getAttribute(`data-${attribute3}`);
      if (value2 != null) {
        handleAttributeChanges({
          callback,
          element: element3,
          value: value2,
          added: true,
          name: ""
        }, true);
      }
    }
  }
}
var callbacks = {
  action: handleActionAttribute,
  input: handleInputAttribute,
  output: handleOutputAttribute,
  target: handleTargetAttribute
};
var attributes2 = Object.keys(callbacks);
var attributesLength = attributes2.length;

// src/observer/document.observer.ts
function observerDocument() {
  return createObserver(document.body, {
    attributeFilter: attributes4,
    attributes: true,
    childList: true,
    subtree: true
  }, (element3, name, value2, added) => {
    handleAttributeChanges({
      added,
      element: element3,
      name,
      value: value2,
      callback: callbacks2[name]
    }, false);
  });
}
var callbacks2 = {
  "data-action": handleActionAttribute,
  "data-controller": handleControllerAttribute,
  "data-input": handleInputAttribute,
  "data-output": handleOutputAttribute,
  "data-target": handleTargetAttribute
};
var attributes4 = Object.keys(callbacks2);

// src/magnus.ts
class Magnus {
  add(name, ctor) {
    if (!controllers.has(name)) {
      createController(name, ctor);
      observer.update();
    }
  }
  remove(name) {
    removeController(name);
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
