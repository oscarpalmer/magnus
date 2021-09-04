const actionOptions = ["capture", "once", "passive"];
const actionPattern = /^(?:(\w+)@)?(\w+)(?::([\w:]+))?$/;
const defaultEventTypes = {
  a: "click",
  button: "click",
  form: "submit",
  select: "change",
  textarea: "input"
};
function getDefaultEventType(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === "input") {
    return element.getAttribute("type") === "submit" ? "click" : "input";
  }
  if (tagName in defaultEventTypes) {
    return defaultEventTypes[tagName];
  }
}
function getActionParameters(element, action) {
  const matches = action.match(actionPattern);
  if (matches == null || matches.length === 0) {
    return;
  }
  const parameters = {
    action,
    name: matches[2],
    options: matches[3],
    type: matches[1]
  };
  if (parameters.type == null) {
    const type = getDefaultEventType(element);
    if (type == null) {
      return;
    }
    parameters.type = type;
  }
  return parameters;
}
class ActionStore {
  constructor() {
    this.actions = new Map();
  }
  add(name, element) {
    const action = this.actions.get(name);
    if (action == null) {
      return;
    }
    action.elements.add(element);
    element.addEventListener(action.type, action.callback, action.options);
  }
  clear() {
    this.actions.forEach((action) => {
      action.elements.forEach((element) => {
        element.removeEventListener(action.type, action.callback, action.options);
      });
      action.elements.clear();
    });
  }
  create(parameters, callback) {
    if (this.actions.has(parameters.action)) {
      return;
    }
    this.actions.set(parameters.action, {
      callback,
      elements: new Set(),
      options: this.getOptions(parameters.options || ""),
      type: parameters.type
    });
  }
  has(name) {
    return this.actions.has(name);
  }
  remove(name, element) {
    const action = this.actions.get(name);
    if (action == null) {
      return;
    }
    action.elements.delete(element);
    element.removeEventListener(action.type, action.callback, action.options);
    if (action.elements.size === 0) {
      this.actions.delete(name);
    }
  }
  getOptions(options) {
    const x = {
      capture: false,
      once: false,
      passive: false
    };
    const parts = options.split(":");
    for (const property of actionOptions) {
      if (parts.indexOf(property) > -1) {
        x[property] = true;
      }
    }
    return x;
  }
}
const observerAttributes = "attributes";
const observerChildList = "childList";
const observerOptions = {
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
};
class Observer {
  constructor(element) {
    this.element = element;
    this.observer = new MutationObserver(this.observe.bind(this));
  }
  start() {
    this.observer.observe(this.element, this.getOptions());
    this.handleNodes([this.element], true);
  }
  stop() {
    this.observer.disconnect();
  }
  getAttributes(oldAttribute, newAttribute) {
    const oldAttributeValues = oldAttribute.split(" ");
    const newAttributeValues = newAttribute.split(" ");
    const addedValues = [];
    const removedValues = [];
    for (const value of oldAttributeValues) {
      if (value !== "" && newAttributeValues.indexOf(value) === -1) {
        removedValues.push(value);
      }
    }
    for (const value of newAttributeValues) {
      if (value !== "" && oldAttributeValues.indexOf(value) === -1) {
        addedValues.push(value);
      }
    }
    return [addedValues, removedValues];
  }
  handleNodes(nodes, added) {
    for (const node of nodes || []) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.handleElement(node, added);
        this.handleNodes(node.childNodes, added);
      }
    }
  }
  observe(entries) {
    for (const entry of entries) {
      if (entry.type === observerChildList) {
        this.handleNodes(entry.addedNodes, true);
        this.handleNodes(entry.removedNodes, false);
      } else if (entry.type === observerAttributes) {
        this.handleAttribute(entry.target, entry.attributeName || "", entry.oldValue || "");
      }
    }
  }
}
class ControllerObserver extends Observer {
  constructor(context) {
    super(context.element);
    this.context = context;
    this.actionAttribute = `data-${context.identifier}-action`;
    this.targetAttribute = `data-${context.identifier}-target`;
  }
  getOptions() {
    const options = Object.assign({}, observerOptions);
    options.attributeFilter = [
      this.actionAttribute,
      this.targetAttribute
    ];
    return options;
  }
  handleAttribute(element, attributeName, oldValue, removedElement) {
    let newValue = element.getAttribute(attributeName) || "";
    if (newValue === oldValue) {
      return;
    }
    if (removedElement === true) {
      oldValue = newValue;
      newValue = "";
    }
    const callback = attributeName === this.actionAttribute ? this.handleAction : this.handleTarget;
    this.handleChanges(element, oldValue, newValue, callback);
  }
  handleElement(element, added) {
    [this.actionAttribute, this.targetAttribute].forEach((attribute) => {
      this.handleAttribute(element, attribute, "", !added);
    });
  }
  handleAction(element, action, added) {
    if (this.context.store.actions.has(action)) {
      if (added) {
        this.context.store.actions.add(action, element);
      } else {
        this.context.store.actions.remove(action, element);
      }
      return;
    }
    if (!added) {
      return;
    }
    const parameters = getActionParameters(element, action);
    if (parameters == null) {
      return;
    }
    const callback = this.context.controller[parameters.name];
    if (typeof callback !== "function") {
      return;
    }
    this.context.store.actions.create(parameters, callback.bind(this.context.controller));
    this.context.store.actions.add(action, element);
  }
  handleChanges(element, oldValue, newValue, callback) {
    this.getAttributes(oldValue, newValue).forEach((attributes, index2) => {
      const added = index2 === 0;
      for (const attribute of attributes) {
        callback.call(this, element, attribute, added);
      }
    });
  }
  handleTarget(element, target, added) {
    if (added) {
      this.context.store.targets.add(target, element);
    } else {
      this.context.store.targets.remove(target, element);
    }
  }
}
class DataStoreHandlers {
  constructor(store) {
    this.store = store;
  }
  get callback() {
    return this.store.context.controller.dataChanged;
  }
  get(target, property) {
    return Reflect.get(target, property);
  }
  set(target, property, value) {
    return Reflect.set(target, property, value) && this.handleChange(property, Reflect.get(target, property), value);
  }
  handleChange(property, oldValue, newValue) {
    if (typeof this.callback === "function") {
      this.callback.call(this.store.context.controller, { property, values: { new: newValue, old: oldValue } });
    }
    return true;
  }
}
class DataStore {
  constructor(context) {
    this.context = context;
    this.handlers = new DataStoreHandlers(this);
    this.proxy = new Proxy({}, this.handlers);
  }
}
class TargetStore {
  constructor(context) {
    this.context = context;
    this.targets = new Map();
  }
  get callback() {
    return this.context.controller.targetChanged;
  }
  add(name, element) {
    if (this.targets.has(name)) {
      this.targets.get(name)?.add(element);
    } else {
      this.targets.set(name, new Set()).get(name)?.add(element);
    }
    this.handleChange(name, element, true);
  }
  clear() {
    this.targets.forEach((elements) => {
      elements.clear();
    });
  }
  get(name) {
    return Array.from(this.targets.get(name) || []);
  }
  has(name) {
    return this.targets.has(name);
  }
  remove(name, element) {
    const targets = this.targets.get(name);
    if (targets == null) {
      return;
    }
    targets.delete(element);
    if (targets.size === 0) {
      this.targets.delete(name);
    }
    this.handleChange(name, element, false);
  }
  handleChange(name, element, added) {
    if (typeof this.callback === "function") {
      this.callback.call(this.context.controller, { element, name, added });
    }
  }
}
class Store {
  constructor(context) {
    this.actions = new ActionStore();
    this.data = new DataStore(context);
    this.targets = new TargetStore(context);
  }
}
class Context {
  constructor(application, identifier, element, ControllerConstructor2) {
    this.application = application;
    this.identifier = identifier;
    this.element = element;
    this.store = new Store(this);
    this.observer = new ControllerObserver(this);
    this.controller = new ControllerConstructor2(this);
    this.observer.start();
    this.controller.connect();
  }
  findElement(selector) {
    return this.element.querySelector(selector);
  }
  findElements(selector) {
    return Array.from(this.element.querySelectorAll(selector));
  }
}
class ControllerStore {
  constructor(application) {
    this.application = application;
    this.controllers = new Map();
  }
  add(identifier, element) {
    const blob = this.controllers.get(identifier);
    if (blob != null) {
      blob.instances.set(element, new Context(this.application, identifier, element, blob.controllerConstructor).controller);
    }
  }
  create(identifier, controllerConstructor) {
    if (!this.controllers.has(identifier)) {
      this.controllers.set(identifier, {
        controllerConstructor,
        instances: new Map()
      });
    }
  }
  remove(identifier, element) {
    const blob = this.controllers.get(identifier);
    if (blob == null) {
      return;
    }
    const instance = blob.instances.get(element);
    if (instance == null) {
      return;
    }
    instance.context.observer.stop();
    instance.context.store.actions.clear();
    instance.context.store.targets.clear();
    blob.instances.delete(element);
    instance.disconnect();
  }
}
const dataControllerAttribute = "data-controller";
class DocumentObserver extends Observer {
  constructor(controllers) {
    super(document.documentElement);
    this.controllers = controllers;
  }
  getOptions() {
    const options = Object.assign({}, observerOptions);
    options.attributeFilter = [dataControllerAttribute];
    return options;
  }
  handleAttribute(element, attributeName, oldValue, removedElement) {
    let newValue = element.getAttribute(attributeName) || "";
    if (newValue === oldValue) {
      return;
    }
    if (removedElement === true) {
      oldValue = newValue;
      newValue = "";
    }
    this.handleChanges(element, newValue, oldValue);
  }
  handleElement(element, added) {
    if (element.hasAttribute(dataControllerAttribute)) {
      this.handleAttribute(element, dataControllerAttribute, "", !added);
    }
  }
  handleChanges(element, newValue, oldValue) {
    this.getAttributes(oldValue, newValue).forEach((attributes, index2) => {
      const added = index2 === 0;
      for (const attribute of attributes) {
        if (added) {
          this.controllers.add(attribute, element);
        } else {
          this.controllers.remove(attribute, element);
        }
      }
    });
  }
}
class Application {
  constructor() {
    this.controllers = new ControllerStore(this);
    this.observer = new DocumentObserver(this.controllers);
  }
  add(name, controller) {
    this.controllers.create(name, controller);
  }
  start() {
    this.observer.start();
  }
  stop() {
    this.observer.stop();
  }
}
class Controller {
  constructor(context) {
    this.context = context;
  }
  get data() {
    return this.context.store.data.proxy;
  }
  get element() {
    return this.context.element;
  }
  get identifier() {
    return this.context.identifier;
  }
  connect() {
  }
  dataChanged(data) {
  }
  disconnect() {
  }
  hasTarget(name) {
    return this.context.store.targets.has(name);
  }
  target(name) {
    return this.context.store.targets.get(name)[0];
  }
  targetChanged(target) {
  }
  targets(name) {
    return this.context.store.targets.get(name);
  }
}
var index = { Application, Controller };
export { index as default };
