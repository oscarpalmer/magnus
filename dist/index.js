// src/controller/controller.ts
var attribute = "data-controller";

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
// node_modules/@oscarpalmer/atoms/dist/js/is.mjs
var isNullableOrWhitespace = function(value) {
  return value == null || /^\s*$/.test(getString(value));
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
var parse = function(value, reviver) {
  try {
    return JSON.parse(value, reviver);
  } catch {
  }
};
// src/observer/attributes/data.attribute.ts
function handleDataAttribute(context, name, value) {
  context.data.value[name] = parse(value) ?? value;
}

// src/observer/observer.ts
function createObserver(element, options, attributeHandler) {
  let frame;
  const observer = new MutationObserver((entries) => {
    for (const entry of entries) {
      if (entry.type === "childList") {
        instance.handleNodes(entry.addedNodes, true);
        instance.handleNodes(entry.removedNodes, false);
      } else if (entry.type === "attributes" && entry.target instanceof Element) {
        attributeHandler(entry.target, entry.attributeName ?? "", entry.oldValue ?? "", true);
      }
    }
  });
  const instance = Object.create({
    handleElement(element2, added) {
      const attributes = [...element2.attributes];
      for (const attribute2 of attributes) {
        attributeHandler(element2, attribute2.name, "", added);
      }
    },
    handleNodes(nodes, added) {
      for (const node of nodes) {
        if (node instanceof Element) {
          this.handleElement(node, added);
          this.handleNodes(node.childNodes, added);
        }
      }
    },
    start() {
      observer.observe(element, options);
      this.update();
    },
    stop() {
      observer.disconnect();
    },
    update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        this.handleNodes([element], true);
      });
    }
  });
  if (element.ownerDocument.readyState === "complete") {
    instance.start();
  } else {
    element.ownerDocument.addEventListener("DOMContentLoaded", () => {
      instance.start();
    });
  }
  return instance;
}
var options = {
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
};

// src/observer/controller.observer.ts
function observeController(context) {
  const prefix = `data-${context.identifier}-`;
  const { length } = prefix;
  return createObserver(context.element, {
    ...options
  }, (element, name) => {
    if (name.startsWith(prefix)) {
      handleDataAttribute(context, name.slice(length), element.getAttribute(name) ?? "");
    }
  });
}

// src/store/action.store.ts
function createActions() {
  const store = new Map;
  return Object.create({
    add(name, element) {
      const action = store.get(name);
      if (action != null) {
        action.targets.add(element);
        element.addEventListener(action.type, action.callback, action.options);
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
    remove(name, element) {
      const action = store.get(name);
      if (action != null) {
        element.removeEventListener(action.type, action.callback);
        action.targets.delete(element);
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
  const controller2 = new ctor(context);
  Object.defineProperties(context, {
    controller: {
      value: controller2
    },
    observer: {
      value: observeController(context)
    }
  });
  handleAttributes(context);
  controller2.connected?.();
  return context;
}

// src/store/controller.store.ts
function addController(name, element) {
  const controller2 = controllers.get(name);
  if (controller2 != null && !controller2.instances.has(element)) {
    controller2.instances.set(element, createContext(name, element, controller2.constructor));
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
function removeController(name, element) {
  const stored = controllers.get(name);
  const instance = stored?.instances.get(element);
  if (instance != null) {
    stored?.instances.delete(element);
    instance.actions.clear();
    instance.observer.stop();
    instance.targets.clear();
    instance.controller.disconnected?.();
  }
}
var controllers = new Map;

// src/helpers/attribute.ts
var parseActionAttribute = function(attribute2) {
  const matches = actionAttributePattern.exec(attribute2);
  if (matches == null) {
    return;
  }
  const [, , , , , controller2, identifier, method] = matches;
  return {
    controller: controller2 == null ? identifier : controller2,
    identifier: controller2 == null ? null : identifier,
    name: method
  };
};
function parseAttribute(type, value) {
  return type === "action" ? parseActionAttribute(value) : parseTargetAttribute(value);
}
var parseTargetAttribute = function(attribute2) {
  const matches = targetAttributePattern.exec(attribute2);
  if (matches != null) {
    const [, controller2, identifier, name] = matches;
    return {
      controller: controller2,
      identifier,
      name
    };
  }
};
var actionAttributePattern = /^(?:(?:((\w+)(?:#(\w+))?)@)?(\w+)->)?(\w+)(?:#(\w+))?@(\w+)(?::([a-z:]+))?/i;
var targetAttributePattern = /^(\w+)(?:#(\w+))?\.(\w+)$/i;

// src/helpers/event.ts
function getEventParameters(element, action2) {
  const matches = actionAttributePattern.exec(action2);
  if (matches != null) {
    const [, , , , event, , , callback, options2] = matches;
    const parameters = {
      callback,
      options: getOptions(options2 ?? ""),
      type: event ?? getType(element)
    };
    return parameters.type == null ? undefined : parameters;
  }
}
var getOptions = function(options2) {
  const items = options2.toLowerCase().split(":");
  return {
    capture: items.includes("capture") || items.includes("c"),
    once: items.includes("once") || items.includes("o"),
    passive: !items.includes("active") && !items.includes("a")
  };
};
var getType = function(element) {
  return element instanceof HTMLInputElement ? element.type === "submit" ? "submit" : "input" : defaultEvents[element.tagName];
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
function handleInputAttribute(element, _, value, added) {
  handleTarget("target", element, value, added, handleInput);
}
function handleOutputAttribute(element, _, value, added) {
  handleTarget("target", element, value, added, handleOutput);
}
function handleTarget(type, element, value, added, callback) {
  const parsed = parseAttribute(type, value);
  if (parsed == null) {
    return;
  }
  let identified;
  if (parsed.identifier == null) {
    identified = element.closest(`[data-controller*="${parsed.controller}"]`);
  } else {
    identified = document.querySelector(`#${parsed.identifier}`);
  }
  if (identified == null) {
    return;
  }
  const context2 = controllers.get(parsed.controller)?.instances.get(identified);
  if (context2 != null) {
    callback(context2, element, "", type === "action" ? value : parsed.name, added);
  }
}
function handleTargetAttribute(element, _, value, added) {
  handleTarget("target", element, value, added, handleTargetElement);
}
var handleInput = function(context2, element, _, value, added) {
  const isInput = element instanceof HTMLInputElement;
  const isSelect = element instanceof HTMLSelectElement;
  if (context2 != null && (isInput || isSelect || element instanceof HTMLTextAreaElement)) {
    const isCheckbox = isInput && element.getAttribute("type") === "checkbox";
    handleAction(context2, element, "", isSelect ? "change" : "input", added, (event) => {
      context2.data.value[value] = isCheckbox ? event.target.checked : event.target.value;
    });
    handleTargetElement(context2, element, "", `input:${value}`, added);
  }
};
var handleOutput = function(context2, element, _, value, added) {
  handleTargetElement(context2, element, "", `output:${value}`, added);
};
var handleTargetElement = function(context2, element, _, value, added) {
  if (added) {
    context2.targets.add(value, element);
  } else {
    context2.targets.remove(value, element);
  }
};

// src/observer/attributes/action.attribute.ts
function handleAction(context2, element, _, value, added, handler) {
  if (context2.actions.has(value)) {
    if (added) {
      context2.actions.add(value, element);
    } else {
      context2.actions.remove(value, element);
    }
    return;
  }
  if (!added) {
    return;
  }
  const parameters = handler == null ? getEventParameters(element, value) : {
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
  if (typeof callback === "function") {
    context2.actions.create({
      callback: callback.bind(context2.controller),
      name: value,
      options: parameters.options,
      target: element,
      type: parameters.type
    });
    context2.actions.add(value, element);
  }
}
function handleActionAttribute(element, _, value, added) {
  handleTarget("action", element, value, added, handleAction);
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
function handleControllerAttribute(element, _, value, added) {
  if (added) {
    addController(value, element);
  } else {
    removeController(value, element);
  }
}
function handleAttributes(context2) {
  const identifier = context2.identifier.toLowerCase();
  for (const attribute4 of attributes2) {
    const callback = callbacks[attribute4];
    const elements = document.querySelectorAll(`[data-${attribute4}]`);
    for (const element of elements) {
      const value = element.getAttribute(`data-${attribute4}`);
      if (value == null || !value.toLowerCase().includes(identifier)) {
        continue;
      }
      handleAttributeChanges({
        callback,
        element,
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

// src/observer/document.observer.ts
function observeDocument() {
  const actionAttribute = "data-action";
  const inputAttribute = "data-input";
  const outputAttribute = "data-output";
  const targetAttribute = "data-target";
  const attributes4 = [
    actionAttribute,
    attribute,
    inputAttribute,
    outputAttribute,
    targetAttribute
  ];
  const callbacks2 = {
    [actionAttribute]: handleActionAttribute,
    [attribute]: handleControllerAttribute,
    [inputAttribute]: handleInputAttribute,
    [outputAttribute]: handleOutputAttribute,
    [targetAttribute]: handleTargetAttribute
  };
  return createObserver(document.body, {
    ...options,
    attributeFilter: attributes4
  }, (element, name, value, added) => {
    handleAttributeChanges({
      added,
      element,
      name,
      value,
      callback: callbacks2[name]
    }, false);
  });
}

// src/index.ts
function add(name, ctor) {
  if (controllers.has(name)) {
    throw new Error(`Controller '${name}' already exists`);
  }
  createController(name, ctor);
  documentObserver.update();
}
var documentObserver = observeDocument();
export {
  add,
  Controller
};
