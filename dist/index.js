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

// src/store/data.store.ts
function setAttribute(element, name, value2) {
  if (isNullableOrWhitespace(value2.original)) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value2.stringified);
  }
}
function setElementContents(elements, value2) {
  const { length } = elements;
  for (let index = 0;index < length; index += 1) {
    elements[index].textContent = value2;
  }
}
function setElementValue(element, value2) {
  switch (true) {
    case (element instanceof HTMLInputElement && changeEventTypes.has(element.type)):
      element.checked = element.value === value2 || element.type === "checkbox" && value2 === "true";
      return;
    case ((element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) && element.value !== value2):
      element.value = value2;
      return;
    case (element instanceof HTMLSelectElement && element.value !== value2):
      element.value = [...element.options].findIndex((option) => option.value === value2) > -1 ? value2 : "";
      return;
  }
}
function setElementValues(elements, value2) {
  const { length } = elements;
  for (let index = 0;index < length; index += 1) {
    setElementValue(elements[index], value2);
  }
}
function setValue2(context, prefix, name, value2) {
  const { element, targets } = context;
  setAttribute(element, `${prefix}${name}`, value2);
  setElementContents(targets.getAll(`output:${name}`), value2.stringified);
  setElementValues(targets.getAll(`input:${name}`), value2.stringified);
}
function setValueFromAttribute(context, name, value2) {
  if (getString(context.data.value[name]) !== value2) {
    context.data.value[name] = value2 == null ? value2 : parse(value2) ?? value2;
  }
}

class Data {
  value;
  constructor(context) {
    const frames = {};
    const prefix = `data-${context.name}-`;
    this.value = new Proxy({}, {
      set(target, property, next) {
        const previous = Reflect.get(target, property);
        const nextAsString = getString(next);
        if (getString(previous) === nextAsString) {
          return true;
        }
        const result = Reflect.set(target, property, next);
        if (result) {
          const name = String(property);
          cancelAnimationFrame(frames[name]);
          frames[name] = requestAnimationFrame(() => {
            setValue2(context, prefix, name, {
              original: next,
              stringified: next == null ? "" : nextAsString
            });
          });
        }
        return result;
      }
    });
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

// src/observer/attributes/target.attribute.ts
function handleTargetAttribute(type, element, value2, added) {
  const callback = attributeCallbacks[type];
  const parsed = parseAttribute(type, value2);
  let count2 = 0;
  function step() {
    if (parsed == null || count2 >= 10) {
      return;
    }
    const context = controllers.findContext(element, parsed.name, parsed.id);
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

// src/observer/changes.attribute.ts
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
  let from = initial ? "" : parameters.value;
  let to = initial ? parameters.value : parameters.element.getAttribute(parameters.name) ?? "";
  if (from === to) {
    return;
  }
  if (!parameters.added) {
    [from, to] = [to, from];
  }
  handleChanges(type, {
    from,
    to,
    element: parameters.element,
    handler: parameters.handler,
    name: parameters.name
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
          added: true,
          handler: undefined,
          name: ""
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
  }, (element2, attribute2) => {
    if (attribute2.startsWith(prefix)) {
      context ??= controllers.findContext(element2, name);
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
    return this.getAll(name)[0];
  }
  getAll(name) {
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
  findContext(origin, name, id) {
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
      context2.controller.disconnected?.();
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
      return controllers.findContext(origin, name, id)?.element ?? (noId ? origin.ownerDocument.querySelector(`#${name}`) : undefined);
  }
}

// src/observer/attributes/action.attribute.ts
function handleActionAttribute(context2, element, value2, added, custom) {
  const action2 = custom?.event ?? value2;
  if (context2.actions.has(value2)) {
    if (added) {
      context2.actions.add(value2, element);
    } else {
      context2.actions.remove(value2, element);
    }
    return;
  }
  if (!added) {
    return;
  }
  const parameters = custom?.handler == null ? getEventParameters(element, value2, context2.element === element) : {
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
      name: value2,
      options: parameters.options,
      type: parameters.type
    });
    context2.actions.add(value2, target3);
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
function handleInputAttribute(context2, element, value2, added) {
  const dataType = getDataType(element);
  if (context2 != null && dataType != null) {
    const name = `input:${value2}`;
    const eventType = getEventType(element);
    handleActionAttribute(context2, element, name, added, {
      event: eventType,
      handler: (event2) => {
        setDataValue(dataType, context2, event2.target, value2);
      }
    });
    handleTargetElement(context2, element, name, added);
  }
}
function handleOutputAttribute(context2, element, value2, added) {
  handleTargetElement(context2, element, `output:${value2}`, added);
}
function setDataValue(type, context2, element, name) {
  context2.data.value[name] = type === "boolean" ? element.checked : type === "parseable" ? parse(element.value) ?? element.value : element.value;
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
var actionAttributePattern = /^(?:(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;
var extendedActionAttributePattern = /^(?:(?:(?:(\w+)(?:#(\w+))?)?@)?(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;
var targetAttributePattern = /^(\w+)(?:#(\w+))?\.(\w+)$/i;
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

// src/observer/document.observer.ts
function observerDocument() {
  const attributes3 = [
    controllerAttribute,
    ...attributeTypes.map((type) => `data-${type}`)
  ];
  return createObserver(document.body, {
    attributeFilter: attributes3,
    attributes: true,
    childList: true,
    subtree: true
  }, (element, name, value2, added) => {
    if (attributes3.includes(name)) {
      handleAttributeChanges(name.slice(5), {
        added,
        element,
        name,
        value: value2,
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
