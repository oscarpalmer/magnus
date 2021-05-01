/*!
 * Magnus, v0.15.0
 * https://github.com/oscarpalmer/magnus
 * (c) Oscar Palmér, 2021, MIT @license
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Magnus = factory());
}(this, (function () { 'use strict';

    class Observer {
        constructor(element) {
            this.element = element;
            this.options = this.getOptions();
            this.observer = new MutationObserver(this.observe.bind(this));
        }
        start() {
            this.observer.observe(this.element, this.options);
            this.handleNodes(this.element.childNodes, true);
        }
        stop() {
            this.observer.disconnect();
        }
        getAttributes(oldAttribute, newAttribute) {
            const oldAttributeValues = oldAttribute.split(' ');
            const newAttributeValues = newAttribute.split(' ');
            const addedValues = [];
            const removedValues = [];
            for (const value of oldAttributeValues) {
                if (value !== '' && newAttributeValues.indexOf(value) === -1) {
                    removedValues.push(value);
                }
            }
            for (const value of newAttributeValues) {
                if (value !== '' && oldAttributeValues.indexOf(value) === -1) {
                    addedValues.push(value);
                }
            }
            return [addedValues, removedValues];
        }
        handleNodes(nodes, added) {
            for (const node of (nodes !== null && nodes !== void 0 ? nodes : [])) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    this.handleElement(node, added);
                    this.handleNodes(node.childNodes, added);
                }
            }
        }
        observe(entries) {
            var _a, _b;
            for (const entry of entries) {
                if (entry.type === Observer.CHILDLIST) {
                    this.handleNodes(entry.addedNodes, true);
                    this.handleNodes(entry.removedNodes, false);
                }
                else {
                    this.handleAttribute(entry.target, (_a = entry.attributeName) !== null && _a !== void 0 ? _a : '', (_b = entry.oldValue) !== null && _b !== void 0 ? _b : '');
                }
            }
        }
    }
    Observer.CHILDLIST = 'childList';
    Observer.OPTIONS = {
        attributeOldValue: true,
        attributes: true,
        childList: true,
        subtree: true,
    };

    class ControllerObserver extends Observer {
        constructor(context) {
            super(context.element);
            this.context = context;
            this.attributeAction = `data-${context.identifier}-action`;
            this.attributeTarget = `data-${context.identifier}-target`;
        }
        getOptions() {
            const options = Object.assign({}, Observer.OPTIONS);
            options.attributeFilter = [
                this.attributeAction,
                this.attributeTarget,
            ];
            return options;
        }
        handleAttribute(element, attributeName, oldValue, removedElement) {
            var _a;
            let newValue = (_a = element.getAttribute(attributeName)) !== null && _a !== void 0 ? _a : '';
            if (newValue === oldValue) {
                return;
            }
            if (removedElement === true) {
                oldValue = newValue;
                newValue = '';
            }
            const callback = attributeName === this.attributeAction
                ? this.handleAction
                : this.handleTarget;
            this.handleChanges(element, oldValue, newValue, callback);
        }
        handleElement(element, added) {
            [this.attributeAction, this.attributeTarget].forEach((attribute) => {
                this.handleAttribute(element, attribute, '', !added);
            });
        }
        handleAction(element, action, added) {
            if (this.context.store.actions.has(action)) {
                this.context.store.actions[added ? 'add' : 'remove'](action, element);
                return;
            }
            if (!added) {
                return;
            }
            const parts = action.split(':');
            if (parts.length < 2) {
                return;
            }
            const callback = this.context.controller[parts[1]];
            if (typeof callback === 'function') {
                this.context.store.actions.create(action, parts[0], callback.bind(this.context.controller));
                this.context.store.actions.add(action, element);
            }
        }
        handleChanges(element, oldValue, newValue, callback) {
            this.getAttributes(oldValue, newValue).forEach((attributes, index) => {
                const added = index === 0;
                for (const attribute of attributes) {
                    callback.call(this, element, attribute, added);
                }
            });
        }
        handleTarget(element, target, added) {
            this.context.store.targets[added ? 'add' : 'remove'](target, element);
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
            element.addEventListener(action.type, action.callback);
        }
        clear() {
            this.actions.forEach((action, name) => {
                action.elements.forEach((element) => {
                    element.removeEventListener(action.type, action.callback);
                });
                action.elements.clear();
            });
        }
        create(name, type, callback) {
            if (!this.actions.has(name)) {
                this.actions.set(name, {
                    callback,
                    elements: new Set(),
                    type,
                });
            }
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
            element.removeEventListener(action.type, action.callback);
            if (action.elements.size === 0) {
                this.actions.delete(name);
            }
        }
    }

    class DataStoreHandlers {
        constructor(store) {
            this.store = store;
        }
        get(target, property) {
            return Reflect.get(target, property);
        }
        set(target, property, value) {
            this.handleValue(property, Reflect.get(target, property), value);
            return Reflect.set(target, property, value);
        }
        getProperty(property) {
            return property.replace(DataStoreHandlers.PATTERN, (character) => character.toUpperCase());
        }
        handleValue(property, oldValue, newValue) {
            let callback;
            if (this.store.callbacks.has(property)) {
                callback = this.store.callbacks.get(property);
                if (typeof callback === 'function') {
                    callback.call(this.store.context.controller, newValue, oldValue);
                }
                return;
            }
            callback = this.store.context.controller[`data${this.getProperty(property)}Changed`];
            this.store.callbacks.set(property, callback);
            if (typeof callback === 'function') {
                callback.call(this.store.context.controller, newValue, oldValue);
            }
        }
    }
    DataStoreHandlers.PATTERN = /^\w/;
    class DataStore {
        constructor(context) {
            this.context = context;
            this.callbacks = new Map();
            this.handlers = new DataStoreHandlers(this);
            this.proxy = new Proxy({}, this.handlers);
        }
    }

    class TargetStore {
        constructor() {
            this.targets = new Map();
        }
        add(name, element) {
            var _a, _b;
            if (this.targets.has(name)) {
                (_a = this.targets.get(name)) === null || _a === void 0 ? void 0 : _a.add(element);
            }
            else {
                (_b = this.targets.set(name, new Set()).get(name)) === null || _b === void 0 ? void 0 : _b.add(element);
            }
        }
        clear() {
            this.targets.forEach((elements, name) => {
                elements.clear();
            });
        }
        get(name) {
            var _a;
            return Array.from((_a = this.targets.get(name)) !== null && _a !== void 0 ? _a : []);
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
        }
    }

    class Store {
        constructor(context) {
            this.actions = new ActionStore();
            this.data = new DataStore(context);
            this.targets = new TargetStore();
        }
    }

    class Context {
        constructor(application, identifier, element, ControllerConstructor) {
            this.application = application;
            this.identifier = identifier;
            this.element = element;
            this.store = new Store(this);
            this.observer = new ControllerObserver(this);
            this.controller = new ControllerConstructor(this);
            this.observer.start();
            if (typeof this.controller.connect === 'function') {
                this.controller.connect();
            }
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
            if (blob == null) {
                return;
            }
            const context = new Context(this.application, identifier, element, blob.controllerConstructor);
            element[identifier] = context.controller;
            blob.instances.set(element, context.controller);
        }
        create(identifier, controllerConstructor) {
            if (!this.controllers.has(identifier)) {
                this.controllers.set(identifier, {
                    controllerConstructor,
                    instances: new Map(),
                });
            }
        }
        get(identifier) {
            var _a, _b;
            return Array.from((_b = (_a = this.controllers.get(identifier)) === null || _a === void 0 ? void 0 : _a.instances.values()) !== null && _b !== void 0 ? _b : []);
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
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete element[identifier];
            blob.instances.delete(element);
            if (typeof instance.disconnect === 'function') {
                instance.disconnect();
            }
        }
    }

    class DocumentObserver extends Observer {
        constructor(controllers) {
            super(document.documentElement);
            this.controllers = controllers;
        }
        getOptions() {
            const options = Object.assign({}, Observer.OPTIONS);
            options.attributeFilter = [DocumentObserver.ATTRIBUTE];
            return options;
        }
        handleAttribute(element, attributeName, oldValue, removedElement) {
            var _a;
            let newValue = (_a = element.getAttribute(attributeName)) !== null && _a !== void 0 ? _a : '';
            if (newValue === oldValue) {
                return;
            }
            if (removedElement === true) {
                oldValue = newValue;
                newValue = '';
            }
            this.handleChanges(element, newValue, oldValue);
        }
        handleElement(element, added) {
            if (element.hasAttribute(DocumentObserver.ATTRIBUTE)) {
                this.handleAttribute(element, DocumentObserver.ATTRIBUTE, '', !added);
            }
        }
        handleChanges(element, newValue, oldValue) {
            this.getAttributes(oldValue, newValue).forEach((attributes, index) => {
                const added = index === 0;
                for (const attribute of attributes) {
                    this.controllers[added ? 'add' : 'remove'](attribute, element);
                }
            });
        }
    }
    DocumentObserver.ATTRIBUTE = 'data-controller';

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
        hasTarget(name) {
            return this.context.store.targets.has(name);
        }
        target(name) {
            return this.context.store.targets.get(name)[0];
        }
        targets(name) {
            return this.context.store.targets.get(name);
        }
    }

    var index = { Application, Controller };

    return index;

})));
