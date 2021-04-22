/*!
 * Magnus, v0.12.0
 * https://github.com/oscarpalmer/magnus
 * (c) Oscar Palmér, 2021, MIT @license
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Magnus = factory());
}(this, (function () { 'use strict';

    class ControllerStore {
        constructor(application) {
            this.application = application;
            this.store = new Map();
        }
        add(identifier, element) {
            const blob = this.store.get(identifier);
            if (blob == null) {
                return;
            }
            // eslint-disable-next-line new-cap
            const instance = new blob.controller(this.application, identifier, element);
            element[identifier] = instance;
            blob.instances.set(element, instance);
        }
        create(identifier, controller) {
            if (!this.store.has(identifier)) {
                this.store.set(identifier, {
                    controller,
                    instances: new Map(),
                });
            }
        }
        get(identifier) {
            var _a, _b;
            return Array.from((_b = (_a = this.store.get(identifier)) === null || _a === void 0 ? void 0 : _a.instances.values()) !== null && _b !== void 0 ? _b : []);
        }
        remove(identifier, element) {
            const blob = this.store.get(identifier);
            if (blob == null || !blob.instances.has(element)) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete element[identifier];
            blob.instances.delete(element);
        }
    }

    class Observer {
        constructor(element) {
            this.element = element;
            this.mutationObserverOptions = this.getOptions();
            this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
        }
        disconnect() {
            this.mutationObserver.disconnect();
        }
        handleNodes(nodes, added) {
            for (const node of (nodes !== null && nodes !== void 0 ? nodes : [])) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    this.handleElement(node, added);
                    this.handleNodes(node.childNodes, added);
                }
            }
        }
        observe() {
            this.mutationObserver.observe(this.element, this.mutationObserverOptions);
            this.handleNodes(this.element.childNodes, true);
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
        observeMutations(entries) {
            var _a, _b;
            for (const entry of entries) {
                if (entry.type === Observer.MUTATION_RECORD_CHILDLIST) {
                    this.handleNodes(entry.addedNodes, true);
                    this.handleNodes(entry.removedNodes, false);
                }
                else {
                    this.handleAttribute(entry.target, (_a = entry.attributeName) !== null && _a !== void 0 ? _a : '', (_b = entry.oldValue) !== null && _b !== void 0 ? _b : '');
                }
            }
        }
    }
    Observer.MUTATION_OBSERVER_OPTIONS = {
        attributeOldValue: true,
        attributes: true,
        childList: true,
        subtree: true,
    };
    Observer.MUTATION_RECORD_CHILDLIST = 'childList';

    class DocumentObserver extends Observer {
        constructor(store) {
            super(document.documentElement);
            this.store = store;
        }
        getOptions() {
            const options = Object.assign({}, Observer.MUTATION_OBSERVER_OPTIONS);
            options.attributeFilter = [DocumentObserver.CONTROLLER_ATTRIBUTE];
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
            if (element.hasAttribute(DocumentObserver.CONTROLLER_ATTRIBUTE)) {
                this.handleAttribute(element, DocumentObserver.CONTROLLER_ATTRIBUTE, '', !added);
            }
        }
        handleChanges(element, newValue, oldValue) {
            this.getAttributes(oldValue, newValue).forEach((attributes, index) => {
                const added = index === 0;
                for (const attribute of attributes) {
                    this.store[added ? 'add' : 'remove'](attribute, element);
                }
            });
        }
    }
    DocumentObserver.CONTROLLER_ATTRIBUTE = 'data-controller';

    class Application {
        constructor() {
            this.store = new ControllerStore(this);
            this.observer = new DocumentObserver(this.store);
        }
        add(name, controller) {
            this.store.create(name, controller);
        }
        get(name) {
            return this.store.get(name);
        }
        start() {
            this.observer.observe();
        }
        stop() {
            this.observer.disconnect();
        }
    }

    class ControllerObserver extends Observer {
        constructor(controller) {
            super(controller.element);
            this.attributeAction = `data-${controller.identifier}-action`;
            this.attributeTarget = `data-${controller.identifier}-target`;
            this.controller = controller;
        }
        getOptions() {
            const options = Object.assign({}, Observer.MUTATION_OBSERVER_OPTIONS);
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
            if (this.controller.context.store.actions.has(action)) {
                this.controller.context.store.actions[added ? 'add' : 'remove'](action, element);
                return;
            }
            if (!added) {
                return;
            }
            const parts = action.split(':');
            if (parts.length < 2) {
                return;
            }
            const callback = this.controller[parts[1]];
            if (typeof callback === 'function') {
                this.controller.context.store.actions.create(action, parts[0], callback.bind(this.controller));
                this.controller.context.store.actions.add(action, element);
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
            this.controller.context.store.targets[added ? 'add' : 'remove'](target, element);
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
        get(name) {
            var _a;
            return Array.from((_a = this.targets.get(name)) !== null && _a !== void 0 ? _a : []);
        }
        has(name) {
            var _a, _b;
            return ((_b = (_a = this.targets.get(name)) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0) > 0;
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
        constructor() {
            this.actions = new ActionStore();
            this.targets = new TargetStore();
        }
    }

    class Controller {
        constructor(application, identifier, element) {
            this.identifier = identifier;
            this.element = element;
            this.context = {
                application,
                observer: new ControllerObserver(this),
                store: new Store(),
            };
            this.context.observer.observe();
            this.connect();
        }
        connect() { }
        hasTarget(name) {
            return this.context.store.targets.has(name);
        }
        target(name) {
            return this.targets(name)[0];
        }
        targets(name) {
            return this.context.store.targets.get(name);
        }
    }

    var index = { Application, Controller };

    return index;

})));
