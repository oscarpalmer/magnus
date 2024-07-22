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

// src/observer/attributes/data.attribute.ts
function handleDataAttribute(context, name, value) {
  let data;
  try {
    data = JSON.parse(value);
  } catch (_) {
    data = value;
  }
  context.data.value[name] = data;
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

// src/helpers/event.ts
function getEventParameters(element, action2) {
  const matches = action2.match(pattern);
  if (matches != null) {
    const [, type, callback, options2] = matches;
    const parameters = {
      callback,
      options: getOptions(options2 ?? ""),
      type: type ?? getType(element)
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
  if (element instanceof HTMLInputElement) {
    return element.type === "submit" ? "submit" : "input";
  }
  return defaultEvents[element.tagName.toLowerCase()];
};
var defaultEvents = {
  a: "click",
  button: "click",
  details: "toggle",
  form: "submit",
  select: "change",
  textarea: "input"
};
var pattern = /^(?:(\w+)@)?(\w+)(?::([a-z:]+))?$/i;

// src/observer/attributes/target.attribute.ts
function handleInputAttribute(element, _, value, added) {
  handleTarget(element, value, added, attributeTargetPattern, handleInput);
}
function handleOutputAttribute(element, _, value, added) {
  handleTarget(element, value, added, attributeTargetPattern, handleOutput);
}
function handleTarget(element, value, added, pattern2, callback) {
  const [, identifier, controller3, name] = pattern2.exec(value) ?? [];
  if (controller3 == null || name == null) {
    return;
  }
  let identified;
  if (identifier == null) {
    identified = element.closest(`[data-controller*="${controller3}"]`);
  } else {
    identified = document.querySelector(`#${identifier}`);
  }
  if (identified == null) {
    return;
  }
  const context2 = controllers.get(controller3)?.instances.get(identified);
  if (context2 != null) {
    callback(context2, element, "", name, added);
  }
}
function handleTargetAttribute(element, _, value, added) {
  handleTarget(element, value, added, attributeTargetPattern, handleTargetElement);
}
var handleInput = function(context2, element, _, value, added) {
  if (context2 != null && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    const checkbox = element.getAttribute("type") === "checkbox";
    handleAction(context2, element, "", "input", added, (event) => {
      context2.data.value[value] = checkbox ? event.target.checked : event.target.value;
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
  const parameters = getEventParameters(element, value);
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
  handleTarget(element, value, added, attributeActionPattern, handleAction);
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
function handleAttributeChanges(parameters) {
  const callback = parameters.callbacks[parameters.name];
  if (callback == null) {
    return;
  }
  let from = parameters.value;
  let to = parameters.element.getAttribute(parameters.name) ?? "";
  if (from === to) {
    return;
  }
  if (!parameters.added) {
    [from, to] = [to, from];
  }
  handleChanges({
    callback,
    from,
    to,
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
  const attributes2 = ["action", "input", "output", "target"];
  const callbacks = [
    handleActionAttribute,
    handleInputAttribute,
    handleOutputAttribute,
    handleTargetAttribute
  ];
  const values = [`->${context2.identifier}@`, `->${context2.identifier}.`];
  for (const attribute2 of attributes2) {
    const index = attributes2.indexOf(attribute2);
    const callback = callbacks[index];
    const value = index === 0 ? values[0] : values[1];
    const targets = document.querySelectorAll(`[data-${attribute2}*="${value}"]`);
    if (targets.length === 0) {
      continue;
    }
    for (const target4 of targets) {
      const attributes3 = [...target4.attributes];
      for (const attribute3 of attributes3) {
        if (attribute3.value.includes(value)) {
          callback(target4, "", attribute3.value, true);
        }
      }
    }
  }
}
var attributeActionPattern = /^(?:(\w+)->)?(\w+)@(\w+)$/;
var attributeTargetPattern = /^(?:(\w+)->)?(\w+)?\.(\w+)$/;

// src/observer/document.observer.ts
function observeDocument() {
  const actionAttribute = "data-action";
  const inputAttribute = "data-input";
  const outputAttribute = "data-output";
  const targetAttribute = "data-target";
  const attributes3 = [
    actionAttribute,
    attribute,
    inputAttribute,
    outputAttribute,
    targetAttribute
  ];
  const callbacks = {
    [actionAttribute]: handleActionAttribute,
    [attribute]: handleControllerAttribute,
    [inputAttribute]: handleInputAttribute,
    [outputAttribute]: handleOutputAttribute,
    [targetAttribute]: handleTargetAttribute
  };
  return createObserver(document.body, {
    ...options,
    attributeFilter: attributes3
  }, (element, name, value, added) => {
    handleAttributeChanges({
      added,
      callbacks,
      element,
      name,
      value
    });
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
