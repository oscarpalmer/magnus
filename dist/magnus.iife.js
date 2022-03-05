var Magnus = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toCommonJS = /* @__PURE__ */ ((cache) => {
    return (module, temp) => {
      return cache && cache.get(module) || (temp = __reExport(__markAsModule({}), module, 1), cache && cache.set(module, temp), temp);
    };
  })(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Application: () => Application,
    Controller: () => Controller
  });

  // src/helpers.ts
  var actionPattern = /^(?:(?:(?<global>document|window)->(?:(?<globalEvent>\w+)@))|(?:(?<elementEvent>\w+)@))?(?<name>\w+)(?::(?<options>[\w+:]+))?$/;
  var camelCasedPattern = /([A-Z])/g;
  var dashedPattern = /(?:[_-])([a-z0-9])/g;
  var defaultEventTypes = {
    a: "click",
    button: "click",
    details: "toggle",
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
    const parts = value.split(":");
    return {
      capture: parts.indexOf("capture") > -1,
      once: parts.indexOf("once") > -1,
      passive: parts.indexOf("passive") > -1
    };
  }
  function getActionParameters(element, action) {
    const matches = action.match(actionPattern);
    if (matches == null || matches.groups == null) {
      return;
    }
    const isGlobal = matches.groups.global != null;
    const parameters = {
      action,
      name: matches.groups.name,
      options: matches.groups.options,
      type: isGlobal ? matches.groups.globalEvent : matches.groups.elementEvent
    };
    if (isGlobal) {
      parameters.target = matches.groups.global === "document" ? element.ownerDocument : window;
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
  function getCamelCasedName(value) {
    return value.replace(dashedPattern, (_, character) => character.toUpperCase());
  }
  function getDashedName(value) {
    return value.replace(camelCasedPattern, (_, character) => `-${character.toLowerCase()}`);
  }
  function getDataAttributeName(controller, property) {
    return `data-${controller}-data-${getDashedName(property)}`;
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
    if (typeof value === "string") {
      return value;
    }
    if (typeof value !== "object") {
      return String(value);
    }
    try {
      return JSON.stringify(value);
    } catch (error) {
      return `${value}`;
    }
  }

  // src/observer/observer.ts
  var observerAttributes = "attributes";
  var observerChildList = "childList";
  var observerOptions = {
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  };
  var Observer = class {
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
          this.handleAttribute(entry.target, entry.attributeName || "", entry.oldValue || "", false);
        }
      }
    }
  };

  // src/observer/controller.observer.ts
  var ControllerObserver = class extends Observer {
    constructor(context) {
      super(context.element);
      this.context = context;
      this.actionAttribute = `data-${context.identifier}-action`;
      this.dataAttributePrefix = `data-${context.identifier}-data-`;
      this.targetAttribute = `data-${context.identifier}-target`;
    }
    getOptions() {
      return Object.assign({}, observerOptions);
    }
    handleAttribute(element, name, value, removed) {
      let newValue = element.getAttribute(name) || "";
      if (newValue === value) {
        return;
      }
      if (removed) {
        value = newValue;
        newValue = "";
      }
      if (name.startsWith(this.dataAttributePrefix)) {
        this.handleData(name, newValue);
        return;
      }
      this.handleChanges(element, value, newValue, name === this.actionAttribute ? this.handleAction : this.handleTarget);
    }
    handleElement(element, added) {
      for (let index = 0; index < element.attributes.length; index += 1) {
        const attribute = element.attributes[index].name;
        if (attribute === this.actionAttribute || attribute === this.targetAttribute || attribute.startsWith(this.dataAttributePrefix)) {
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
    handleData(name, value) {
      let property = name.substring(this.dataAttributePrefix.length, name.length);
      if (property == null || property.length === 0) {
        return;
      }
      property = getCamelCasedName(property);
      if (this.context.store.data.skip[property] == null) {
        this.context.store.data.skip[property] = 0;
        this.context.controller.data[property] = getRawValue(value);
        return;
      }
      delete this.context.store.data.skip[property];
    }
    handleTarget(element, target, added) {
      if (added) {
        this.context.store.targets.add(target, element);
      } else {
        this.context.store.targets.remove(target, element);
      }
    }
  };

  // src/store/action.store.ts
  var ActionStore = class {
    constructor() {
      this.actions = /* @__PURE__ */ new Map();
    }
    add(name, target) {
      const action = this.actions.get(name);
      if (action == null) {
        return;
      }
      action.targets.add(target);
      if (action.target == null || action.targets.size === 1) {
        (action.target || target).addEventListener(action.type, action.callback, action.options);
      }
    }
    clear() {
      const actions = this.actions.values();
      for (const action of actions) {
        if (action.target != null) {
          action.target.removeEventListener(action.type, action.callback, action.options);
        } else {
          for (const target of action.targets) {
            target.removeEventListener(action.type, action.callback, action.options);
          }
        }
        action.targets.clear();
      }
    }
    create(parameters, callback) {
      if (this.actions.has(parameters.action)) {
        return;
      }
      this.actions.set(parameters.action, {
        callback,
        target: parameters.target,
        targets: /* @__PURE__ */ new Set(),
        options: getActionOptions(parameters.options || ""),
        type: parameters.type
      });
    }
    has(name) {
      return this.actions.has(name);
    }
    remove(name, target) {
      const action = this.actions.get(name);
      if (action == null) {
        return;
      }
      action.targets.delete(target);
      if (action.target == null) {
        target.removeEventListener(action.type, action.callback, action.options);
      }
      if (action.targets.size > 0) {
        return;
      }
      this.actions.delete(name);
      action.target?.removeEventListener(action.type, action.callback, action.options);
    }
  };

  // src/store/data.store.ts
  var DataStoreHandlers = class {
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
        this.controller.events.data.emit({
          property,
          values: {
            new: value,
            old: oldValue
          }
        });
      }
      return set;
    }
  };
  var DataStore = class {
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
  };

  // src/store/target.store.ts
  var TargetStore = class {
    constructor(context) {
      this.context = context;
      this.targets = /* @__PURE__ */ new Map();
    }
    add(name, element) {
      if (this.targets.has(name)) {
        this.targets.get(name)?.add(element);
      } else {
        this.targets.set(name, /* @__PURE__ */ new Set()).get(name)?.add(element);
      }
      this.context.events.target.emit({ name, added: true, target: element });
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
      this.context.events.target.emit({ name, added: false, target: element });
    }
  };

  // src/store/store.ts
  var Store = class {
    constructor(context) {
      this.actions = new ActionStore();
      this.data = new DataStore(context);
      this.targets = new TargetStore(context);
    }
  };

  // src/controller/events.ts
  var Emitter = class {
    constructor(context) {
      this.context = context;
    }
    listen(callback) {
      this.callback = callback;
    }
    emit(value) {
      this.callback?.call(this.context.controller, value);
    }
  };
  var Events = class {
    constructor(context) {
      this.context = context;
      this.data = new Emitter(this.context);
      this.target = new Emitter(this.context);
    }
    dispatch(name, event) {
      (event?.target ?? this.context.element).dispatchEvent(new CustomEvent(name, {
        bubbles: event?.options?.bubbles ?? false,
        cancelable: event?.options?.cancelable ?? false,
        composed: event?.options?.composed ?? false,
        detail: event && event.data
      }));
    }
  };

  // src/controller/targets.ts
  var Targets = class {
    constructor(context) {
      this.context = context;
    }
    exists(name) {
      return this.context.store.targets.has(name);
    }
    get(name) {
      return this.context.store.targets.get(name);
    }
    find(selector) {
      return Array.from(this.context.element.querySelectorAll(selector));
    }
  };

  // src/controller/context.ts
  var Context = class {
    constructor(application, identifier, element, controller) {
      this.application = application;
      this.identifier = identifier;
      this.element = element;
      this.events = new Events(this);
      this.store = new Store(this);
      this.targets = new Targets(this);
      this.observer = new ControllerObserver(this);
      this.controller = new controller(this);
      this.observer.start();
      this.controller.connect?.call(this.controller);
    }
  };

  // src/store/controller.store.ts
  var ControllerStore = class {
    constructor(application) {
      this.application = application;
      this.controllers = /* @__PURE__ */ new Map();
    }
    add(identifier, element) {
      const controller = this.controllers.get(identifier);
      controller?.instances.set(element, new Context(this.application, identifier, element, controller.constructor));
    }
    create(identifier, constructor) {
      if (!this.controllers.has(identifier)) {
        this.controllers.set(identifier, { constructor, instances: /* @__PURE__ */ new Map() });
      }
    }
    remove(identifier, element) {
      const controller = this.controllers.get(identifier);
      if (controller == null) {
        return;
      }
      const instance = controller.instances.get(element);
      if (instance == null) {
        return;
      }
      instance.observer.stop();
      instance.store.actions.clear();
      instance.store.targets.clear();
      controller.instances.delete(element);
      instance.controller.disconnect?.call(instance.controller);
    }
  };

  // src/observer/document.observer.ts
  var dataControllerAttribute = "data-controller";
  var DocumentObserver = class extends Observer {
    constructor(controllers) {
      super(document.documentElement);
      this.controllers = controllers;
    }
    getOptions() {
      const options = Object.assign({}, observerOptions);
      options.attributeFilter = [dataControllerAttribute];
      return options;
    }
    handleAttribute(element, name, value, removed) {
      let newValue = element.getAttribute(name) || "";
      if (newValue === value) {
        return;
      }
      if (removed) {
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
  };

  // src/application.ts
  var Application = class {
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
  };

  // src/controller/controller.ts
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    get data() {
      return this.context.store.data.proxy;
    }
    get element() {
      return this.context.element;
    }
    get events() {
      return this.context.events;
    }
    get identifier() {
      return this.context.identifier;
    }
    get targets() {
      return this.context.targets;
    }
  };
  return __toCommonJS(src_exports);
})();
