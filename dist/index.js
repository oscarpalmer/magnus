// src/controller/index.ts
class Controller {
  context;
  get element() {
    return this.context.element;
  }
  get data() {
    return this.context.data.value;
  }
  get identifier() {
    return this.context.identifier;
  }
  constructor(context) {
    this.context = context;
  }
}

// node_modules/@oscarpalmer/atoms/dist/js/element/closest.mjs
var closest = function(origin, selector, context) {
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
};
var calculateDistance = function(origin, target) {
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
};
var traverse = function(from, to) {
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
};
// node_modules/@oscarpalmer/atoms/dist/js/string/index.mjs
var getString = function(value) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value !== "object" || value == null) {
    return String(value);
  }
  const valueOff = value.valueOf?.() ?? value;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value) : asString;
};
// node_modules/@oscarpalmer/atoms/dist/js/is.mjs
var isNullableOrWhitespace = function(value) {
  return value == null || /^\s*$/.test(getString(value));
};
// src/store/action.store.ts
function createActions() {
  const store = new Map;
  return Object.create({
    add(name, target) {
      const action = store.get(name);
      if (action != null) {
        action.targets.add(target);
        target.addEventListener(action.type, action.callback, action.options);
      }
    },
    clear() {
      for (const [, action] of store) {
        for (const target of action.targets) {
          target.removeEventListener(action.type, action.callback, action.options);
        }
        action.targets.clear();
      }
      store.clear();
    },
    create(parameters) {
      if (!store.has(parameters.name)) {
        store.set(parameters.name, {
          callback: parameters.callback,
          options: parameters.options,
          targets: new Set,
          type: parameters.type
        });
      }
    },
    has(name) {
      return store.has(name);
    },
    remove(name, target) {
      const action = store.get(name);
      if (action != null) {
        target.removeEventListener(action.type, action.callback);
        action.targets.delete(target);
        if (action.targets.size === 0) {
          store.delete(name);
        }
      }
    }
  });
}

// src/store/data.store.ts
var setValue = function(context, prefix, name, original, stringified) {
  const { element } = context;
  if (isNullableOrWhitespace(original)) {
    element.removeAttribute(`${prefix}${name}`);
  } else {
    element.setAttribute(`${prefix}${name}`, stringified);
  }
  const inputs = context.targets.get(`input:${name}`);
  for (const input of inputs) {
    if ((input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) && input.value !== stringified) {
      input.value = stringified;
    } else if (input instanceof HTMLSelectElement && input.value !== stringified) {
      if (Array.from(input.options).findIndex((option) => option.value === stringified) > -1) {
        input.value = stringified;
      }
    }
  }
  const outputs = context.targets.get(`output:${name}`);
  for (const output of outputs) {
    output.textContent = stringified;
  }
};
function createData(identifier, context) {
  const frames = {};
  const prefix = `data-${identifier}-`;
  const instance = Object.create(null);
  Object.defineProperty(instance, "value", {
    value: new Proxy({}, {
      set(target, property, value) {
        const previous = getString(Reflect.get(target, property));
        const next = getString(value);
        if (Object.is(previous, next)) {
          return true;
        }
        const result = Reflect.set(target, property, value);
        if (result) {
          const name = String(property);
          cancelAnimationFrame(frames[name]);
          frames[name] = requestAnimationFrame(() => {
            setValue(context, prefix, name, value, next);
          });
        }
        return result;
      }
    })
  });
  return instance;
}

// src/store/target.store.ts
function createTargets() {
  const store = new Map;
  const instance = Object.create({
    add(name, element) {
      let targets = store.get(name);
      if (targets == null) {
        targets = new Set;
        store.set(name, targets);
      }
      targets.add(element);
    },
    clear() {
      for (const [, targets] of store) {
        targets.clear();
      }
      store.clear();
    },
    get(name) {
      return [...store.get(name) ?? []];
    },
    remove(name, element) {
      store.get(name)?.delete(element);
    }
  });
  return instance;
}

// src/controller/context.ts
function createContext(name, element, ctor) {
  const context = Object.create(null);
  Object.defineProperties(context, {
    actions: {
      value: createActions()
    },
    data: {
      value: createData(name, context)
    },
    element: {
      value: element
    },
    identifier: {
      value: name
    },
    targets: {
      value: createTargets()
    }
  });
  const controller = new ctor(context);
  Object.defineProperties(context, {
    controller: {
      value: controller
    }
  });
  handleAttributes(context);
  controller.connected?.();
  return context;
}

// src/store/controller.store.ts
function addController(name, element2) {
  const controller = controllers.get(name);
  if (controller != null && !controller.instances.has(element2)) {
    controller.instances.set(element2, createContext(name, element2, controller.constructor));
  }
}
function createController(name, ctor) {
  if (!controllers.has(name)) {
    controllers.set(name, {
      constructor: ctor,
      instances: new Map
    });
  }
}
function findContext(origin, controller, identifier) {
  let identified;
  if (identifier == null) {
    identified = closest(origin, `[data-controller*="${controller}"]`)[0];
  } else {
    identified = document.querySelector(`#${identifier}`);
  }
  return identified == null ? undefined : controllers.get(controller)?.instances.get(identified);
}
function removeController(name, element2) {
  const stored = controllers.get(name);
  if (stored == null) {
    return;
  }
  if (element2 == null) {
    for (const [, context2] of stored.instances) {
      removeInstance(stored, context2);
    }
  } else {
    removeInstance(stored, stored.instances.get(element2));
  }
}
var removeInstance = function(controller, context2) {
  if (context2 != null) {
    context2.actions.clear();
    context2.targets.clear();
    context2.controller.disconnected?.();
    controller?.instances.delete(context2.element);
  }
};
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
      return findContext(origin, name, id)?.element ?? (noId ? document.querySelector(`#${name}`) : undefined);
  }
}

// src/helpers/attribute.ts
var parseActionAttribute = function(attribute) {
  const matches = extendedActionAttributePattern.exec(attribute);
  if (matches == null) {
    return;
  }
  const [, , , , controller2, identifier, method] = matches;
  return {
    controller: controller2 == null ? identifier : controller2,
    identifier: controller2 == null ? undefined : identifier,
    name: method
  };
};
function parseAttribute(type, value) {
  return type === "action" ? parseActionAttribute(value) : parseTargetAttribute(value);
}
var parseTargetAttribute = function(attribute) {
  const matches = targetAttributePattern.exec(attribute);
  if (matches != null) {
    const [, controller2, identifier, name] = matches;
    return {
      controller: controller2,
      identifier,
      name
    };
  }
};
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
    if (typeof matches.controller === "string") {
      parameters.external = {
        controller: matches.controller,
        identifier: matches.identifier
      };
    }
    return parameters.type == null ? undefined : parameters;
  }
}
var getMatches = function(matches, isParent) {
  return {
    callback: matches[isParent ? 6 : 4],
    controller: matches[isParent ? 1 : -1],
    event: matches[isParent ? 3 : 1],
    identifier: matches[isParent ? 2 : -1],
    options: matches[isParent ? 7 : 5]
  };
};
var getOptions = function(options) {
  const items = options.toLowerCase().split(":");
  return {
    capture: items.includes("capture") || items.includes("c"),
    once: items.includes("once") || items.includes("o"),
    passive: !items.includes("active") && !items.includes("a")
  };
};
var getType = function(element2) {
  return element2 instanceof HTMLInputElement ? element2.type === "submit" ? "submit" : "input" : defaultEvents[element2.tagName];
};
var defaultEvents = {
  A: "click",
  BUTTON: "click",
  DETAILS: "toggle",
  FORM: "submit",
  SELECT: "change",
  TEXTAREA: "input"
};

// src/observer/attributes/target.attribute.ts
function handleInputAttribute(element2, _, value, added) {
  handleTarget("target", element2, value, added, handleInput);
}
function handleOutputAttribute(element2, _, value, added) {
  handleTarget("target", element2, value, added, handleOutput);
}
function handleTarget(type, element2, value, added, callback) {
  const parsed = parseAttribute(type, value);
  if (parsed == null) {
    return;
  }
  const context2 = findContext(element2, parsed.controller, parsed.identifier);
  if (context2 != null) {
    callback(context2, element2, "", type === "action" ? value : parsed.name, added);
  }
}
function handleTargetAttribute(element2, _, value, added) {
  handleTarget("target", element2, value, added, handleTargetElement);
}
var handleInput = function(context2, element2, _, value, added) {
  const isInput = element2 instanceof HTMLInputElement;
  const isSelect = element2 instanceof HTMLSelectElement;
  if (context2 != null && (isInput || isSelect || element2 instanceof HTMLTextAreaElement)) {
    const event = isSelect ? "change" : "input";
    const isCheckbox = isInput && element2.getAttribute("type") === "checkbox";
    const name = `${event}:${value}`;
    handleAction(context2, element2, name, event, added, (event2) => {
      context2.data.value[value] = isCheckbox ? event2.target.checked : event2.target.value;
    });
    handleTargetElement(context2, element2, "", name, added);
  }
};
var handleOutput = function(context2, element2, _, value, added) {
  handleTargetElement(context2, element2, "", `output:${value}`, added);
};
var handleTargetElement = function(context2, element2, _, value, added) {
  if (added) {
    context2.targets.add(value, element2);
  } else {
    context2.targets.remove(value, element2);
  }
};

// src/observer/attributes/action.attribute.ts
function handleAction(context2, element3, name, value, added, handler) {
  const action3 = handler == null ? value : name;
  if (context2.actions.has(action3)) {
    if (added) {
      context2.actions.add(action3, element3);
    } else {
      context2.actions.remove(action3, element3);
    }
    return;
  }
  if (!added) {
    return;
  }
  const parameters = handler == null ? getEventParameters(element3, value, context2.element === element3) : {
    callback: "",
    options: {
      capture: false,
      once: false,
      passive: true
    },
    type: value
  };
  if (parameters == null) {
    return;
  }
  const callback = handler ?? context2.controller[parameters.callback];
  if (typeof callback !== "function") {
    return;
  }
  const target3 = parameters.external == null ? element3 : findTarget(element3, parameters.external.controller, parameters.external.identifier);
  if (target3 != null) {
    context2.actions.create({
      callback: callback.bind(context2.controller),
      name: action3,
      options: parameters.options,
      type: parameters.type
    });
    context2.actions.add(action3, target3);
  }
}
function handleActionAttribute(element3, _, value, added) {
  handleTarget("action", element3, value, added, handleAction);
}

// src/observer/attributes/index.ts
var getChanges = function(from, to) {
  const fromValues = from.split(/\s+/).map((part) => part.trim()).filter((part) => part.length > 0);
  const toValues = to.split(/\s+/).map((part) => part.trim()).filter((part) => part.length > 0);
  const attributes2 = [[], []];
  for (let outer = 0;outer < 2; outer += 1) {
    const values = outer === 0 ? fromValues : toValues;
    const other = outer === 1 ? fromValues : toValues;
    const { length } = values;
    for (let inner = 0;inner < length; inner += 1) {
      const value = values[inner];
      if (!other.includes(value)) {
        attributes2[outer].push(value);
      }
    }
  }
  return attributes2;
};
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
var handleChanges = function(parameters) {
  const changes = getChanges(parameters.from, parameters.to);
  for (const changed of changes) {
    const added = changes.indexOf(changed) === 1;
    for (const change of changed) {
      parameters.callback(parameters.element, parameters.name, change, added);
    }
  }
};
function handleControllerAttribute(element3, _, value, added) {
  if (added) {
    addController(value, element3);
  } else {
    removeController(value, element3);
  }
}
function handleAttributes(context2) {
  const identifier = context2.identifier.toLowerCase();
  for (const attribute3 of attributes2) {
    const callback = callbacks[attribute3];
    const elements = document.querySelectorAll(`[data-${attribute3}]`);
    for (const element3 of elements) {
      const value = element3.getAttribute(`data-${attribute3}`);
      if (value == null || !value.toLowerCase().includes(identifier)) {
        continue;
      }
      handleAttributeChanges({
        callback,
        element: element3,
        value,
        added: true,
        name: ""
      }, true);
    }
  }
}
var attributes2 = ["action", "input", "output", "target"];
var callbacks = {
  action: handleActionAttribute,
  input: handleInputAttribute,
  output: handleOutputAttribute,
  target: handleTargetAttribute
};

// src/observer/index.ts
function createObserver() {
  let running = false;
  let frame;
  const observer = new MutationObserver((entries) => {
    for (const entry of entries) {
      if (entry.type === "childList") {
        handleNodes(entry.addedNodes, true);
        handleNodes(entry.removedNodes, false);
      } else if (entry.type === "attributes" && entry.target instanceof Element) {
        handleAttribute(entry.target, entry.attributeName ?? "", entry.oldValue ?? "", true);
      }
    }
  });
  const instance = Object.create({
    start() {
      if (running) {
        return;
      }
      running = true;
      observer.observe(document.body, {
        attributeFilter: attributes4,
        attributeOldValue: true,
        attributes: true,
        childList: true,
        subtree: true
      });
      this.update();
    },
    stop() {
      if (!running) {
        return;
      }
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    },
    update() {
      if (!running) {
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        handleNodes([document.body], true);
      });
    }
  });
  if (document.body.ownerDocument.readyState === "complete") {
    instance.start();
  } else {
    document.body.ownerDocument.addEventListener("DOMContentLoaded", () => {
      instance.start();
    });
  }
  return instance;
}
var handleAttribute = function(element3, name, value, added) {
  handleAttributeChanges({
    added,
    element: element3,
    name,
    value,
    callback: callbacks2[name]
  }, false);
};
var handleElement = function(element3, added) {
  const attributes4 = [...element3.attributes];
  for (const attribute3 of attributes4) {
    handleAttribute(element3, attribute3.name, "", added);
  }
};
var handleNodes = function(nodes, added) {
  for (const node of nodes) {
    if (node instanceof Element) {
      handleElement(node, added);
      handleNodes(node.childNodes, added);
    }
  }
};
var actionAttribute = "data-action";
var controllerAttribute = "data-controller";
var inputAttribute = "data-input";
var outputAttribute = "data-output";
var targetAttribute = "data-target";
var attributes4 = [
  actionAttribute,
  controllerAttribute,
  inputAttribute,
  outputAttribute,
  targetAttribute
];
var callbacks2 = {
  [actionAttribute]: handleActionAttribute,
  [controllerAttribute]: handleControllerAttribute,
  [inputAttribute]: handleInputAttribute,
  [outputAttribute]: handleOutputAttribute,
  [targetAttribute]: handleTargetAttribute
};

// src/magnus.ts
var createMagnus = function() {
  const observer2 = createObserver();
  const instance = Object.create({
    add(name, ctor) {
      if (controllers.has(name)) {
        throw new Error(`Controller '${name}' already exists`);
      }
      createController(name, ctor);
      observer2.update();
    },
    remove(name) {
      removeController(name);
    },
    start() {
      observer2.start();
    },
    stop() {
      observer2.stop();
    }
  });
  return instance;
};
var magnus_default = createMagnus();
export {
  magnus_default as magnus,
  Controller
};
