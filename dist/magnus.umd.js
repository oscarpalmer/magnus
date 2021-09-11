(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Magnus = factory());
})(this, function() {
  "use strict";
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
      for (const attribute of oldAttributeValues) {
        if (attribute !== "" && newAttributeValues.indexOf(attribute) === -1) {
          removedValues.push(attribute);
        }
      }
      for (const attribute of newAttributeValues) {
        if (attribute !== "" && oldAttributeValues.indexOf(attribute) === -1) {
          addedValues.push(attribute);
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
  const actionOptions = ["capture", "once", "passive"];
  const actionPattern = /^(?:(\w+)@)?(\w+)(?::([\w:]+))?$/;
  const defaultEventTypes = {
    a: "click",
    button: "click",
    form: "submit",
    select: "change",
    textarea: "input"
  };
  function debounce(timers, name, callback) {
    clearTimeout(timers[name]);
    timers[name] = setTimeout(() => {
      delete timers[name];
      callback();
    }, 250);
  }
  function getActionOptions(value) {
    const options = {
      capture: false,
      once: false,
      passive: false
    };
    const parts = value.split(":");
    for (const option of actionOptions) {
      if (parts.indexOf(option) > -1) {
        options[option] = true;
      }
    }
    return options;
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
  function getCamelCasedName(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, character) => character.toUpperCase());
  }
  function getDashedName(value) {
    return value.replace(/([A-Z])/g, (_, character) => `-${character.toLowerCase()}`);
  }
  function getDataAttributeName(prefix, property) {
    return `data-${prefix}-data-${getDashedName(property)}`;
  }
  function getDefaultEventType(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName === "input") {
      return element.getAttribute("type") === "submit" ? "click" : "input";
    }
    if (tagName in defaultEventTypes) {
      return defaultEventTypes[tagName];
    }
  }
  function getRawValue(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
  function getStringValue(value) {
    if (typeof value !== "object") {
      return value;
    }
    try {
      return JSON.stringify(value);
    } catch (error) {
      return `${value}`;
    }
  }
  class ControllerObserver extends Observer {
    constructor(context) {
      super(context.element);
      this.context = context;
      this.actionAttribute = `data-${context.identifier}-action`;
      this.targetAttribute = `data-${context.identifier}-target`;
      this.attributePattern = new RegExp(`^data-${this.context.identifier}-(class|data)-([\\w+\\-_]+)$`);
      this.attributes = [this.actionAttribute, this.targetAttribute];
    }
    getOptions() {
      return Object.assign({}, observerOptions);
    }
    handleAttribute(element, name, value, removedElement) {
      let property = "";
      let type = 0;
      if (element === this.context.element && this.attributes.indexOf(name) === -1) {
        const matches = name.match(this.attributePattern);
        if (matches == null || matches.length === 0) {
          return;
        }
        property = getCamelCasedName(matches[2]);
        type = matches[1] === "class" ? 1 : 2;
      }
      let newValue = element.getAttribute(name) || "";
      if (newValue === value) {
        return;
      }
      if (removedElement === true) {
        value = newValue;
        newValue = "";
      }
      if (type === 1) {
        this.context.store.classes.set(property, newValue);
        return;
      }
      if (type === 2) {
        if (this.context.store.data.skip[property] == null) {
          this.context.store.data.skip[property] = 0;
          this.context.controller.data[property] = getRawValue(newValue);
          return;
        }
        delete this.context.store.data.skip[property];
        return;
      }
      const callback = name === this.actionAttribute ? this.handleAction : this.handleTarget;
      this.handleChanges(element, value, newValue, callback);
    }
    handleElement(element, added) {
      for (let index2 = 0; index2 < element.attributes.length; index2 += 1) {
        const attribute = element.attributes[index2].name;
        if (this.attributes.indexOf(attribute) > -1 || element === this.context.element && this.attributePattern.test(attribute)) {
          this.handleAttribute(element, attribute, "", !added);
        }
      }
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
      const allAttributes = this.getAttributes(oldValue, newValue);
      for (const attributes of allAttributes) {
        const added = allAttributes.indexOf(attributes) === 0;
        for (const attribute of attributes) {
          callback.call(this, element, attribute, added);
        }
      }
    }
    handleTarget(element, target, added) {
      if (added) {
        this.context.store.targets.add(target, element);
      } else {
        this.context.store.targets.remove(target, element);
      }
    }
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
      const actions = this.actions.values();
      for (const action of actions) {
        for (const element of action.elements) {
          element.removeEventListener(action.type, action.callback, action.options);
        }
        action.elements.clear();
      }
    }
    create(parameters, callback) {
      if (this.actions.has(parameters.action)) {
        return;
      }
      this.actions.set(parameters.action, {
        callback,
        elements: new Set(),
        options: getActionOptions(parameters.options || ""),
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
  }
  class ClassesStore {
    constructor() {
      this.values = {};
    }
    set(name, value) {
      if (value == null || value === "") {
        delete this.values[name];
      } else {
        this.values[name] = value;
      }
    }
  }
  class DataStoreHandlers {
    constructor(store) {
      this.store = store;
    }
    get controller() {
      return this.store.context.controller;
    }
    get(target, property) {
      return Reflect.get(target, property);
    }
    set(target, property, value) {
      const oldValue = Reflect.get(target, property);
      const set = Reflect.set(target, property, value);
      if (set) {
        debounce(this.store.timers, property, () => {
          this.store.setAttribute(property, value);
        });
        if (typeof this.controller.dataChanged === "function") {
          this.controller.dataChanged.call(this.controller, {
            property,
            values: {
              new: value,
              old: oldValue
            }
          });
        }
      }
      return set;
    }
  }
  class DataStore {
    constructor(context) {
      this.context = context;
      this.skip = {};
      this.timers = {};
      this.handlers = new DataStoreHandlers(this);
      this.proxy = new Proxy({}, this.handlers);
    }
    setAttribute(property, value) {
      if (this.skip[property] != null) {
        delete this.skip[property];
        return;
      }
      this.skip[property] = 0;
      if (value == null || value === "") {
        this.context.element.removeAttribute(getDataAttributeName(this.context.identifier, property));
        return;
      }
      this.context.element.setAttribute(getDataAttributeName(this.context.identifier, property), getStringValue(value));
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
      const targets = this.targets.values();
      for (const elements of targets) {
        elements.clear();
      }
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
      this.classes = new ClassesStore();
      this.data = new DataStore(context);
      this.targets = new TargetStore(context);
    }
  }
  class Context {
    constructor(application, identifier, element, controller) {
      this.application = application;
      this.identifier = identifier;
      this.element = element;
      this.store = new Store(this);
      this.observer = new ControllerObserver(this);
      this.controller = new controller(this);
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
      const storedController = this.controllers.get(identifier);
      if (storedController != null) {
        storedController.instances.set(element, new Context(this.application, identifier, element, storedController.constructor).controller);
      }
    }
    create(identifier, constructor) {
      if (!this.controllers.has(identifier)) {
        this.controllers.set(identifier, { constructor, instances: new Map() });
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
    handleAttribute(element, name, value, removedElement) {
      let newValue = element.getAttribute(name) || "";
      if (newValue === value) {
        return;
      }
      if (removedElement === true) {
        value = newValue;
        newValue = "";
      }
      this.handleChanges(element, newValue, value);
    }
    handleElement(element, added) {
      if (element.hasAttribute(dataControllerAttribute)) {
        this.handleAttribute(element, dataControllerAttribute, "", !added);
      }
    }
    handleChanges(element, newValue, oldValue) {
      const allAttributes = this.getAttributes(oldValue, newValue);
      for (const attributes of allAttributes) {
        const added = allAttributes.indexOf(attributes) === 0;
        for (const attribute of attributes) {
          if (added) {
            this.controllers.add(attribute, element);
          } else {
            this.controllers.remove(attribute, element);
          }
        }
      }
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
    get classes() {
      return Object.assign({}, this.context.store.classes.values);
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
  return index;
});
