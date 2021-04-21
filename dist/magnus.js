/*!
 * Magnus, v0.9.0
 * https://github.com/oscarpalmer/magnus
 * (c) Oscar Palmér, 2021, MIT @license
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Magnus = factory());
}(this, (function () { 'use strict';

    class Observer {
        constructor(identifier, element) {
            this.identifier = identifier;
            this.element = element;
            this.attributeAction = `data-${this.identifier}-action`;
            this.attributeTarget = `data-${this.identifier}-target`;
            this.mutationOptions = this.getOptions();
            this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
        }
        disconnect() {
            this.mutationObserver.disconnect();
        }
        handleNodes(nodes, added) {
            if (nodes != null && nodes.length > 0) {
                for (const node of nodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.handleElement(node, added);
                        this.handleNodes(node.childNodes, added);
                    }
                }
            }
        }
        observe() {
            this.mutationObserver.observe(this.element, Observer.MUTATION_OBSERVER_OPTIONS);
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
        getOptions() {
            const options = Observer.MUTATION_OBSERVER_OPTIONS;
            if (this.element === document.documentElement) {
                options.attributeFilter = [Observer.CONTROLLER_ATTRIBUTE];
                return options;
            }
            options.attributeFilter = [
                this.attributeAction,
                this.attributeTarget,
            ];
            return options;
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
    Observer.CONTROLLER_ATTRIBUTE = 'data-controller';
    Observer.MUTATION_OBSERVER_OPTIONS = {
        attributeOldValue: true,
        attributes: true,
        childList: true,
        subtree: true,
    };
    Observer.MUTATION_RECORD_CHILDLIST = 'childList';

    class DocumentObserver extends Observer {
        constructor(controllers) {
            super('magnus', document.documentElement);
            this.controllers = controllers;
        }
        handleAttribute(element, attributeName, oldValue) {
            var _a;
            const newValue = (_a = element.getAttribute(attributeName)) !== null && _a !== void 0 ? _a : '';
            if (attributeName === Observer.CONTROLLER_ATTRIBUTE && newValue !== oldValue) {
                this.handleChanges(element, attributeName, newValue, oldValue);
            }
        }
        handleElement(element, added) {
            var _a;
            if (!element.hasAttribute(Observer.CONTROLLER_ATTRIBUTE)) {
                return;
            }
            const attributeValue = (_a = element.getAttribute(Observer.CONTROLLER_ATTRIBUTE)) !== null && _a !== void 0 ? _a : '';
            const attributeParts = attributeValue.split(' ');
            this.toggleAttributes(element, attributeParts, added);
        }
        addController(element, identifier) {
            if (this.controllers.has(identifier) && element[identifier] == null) {
                const StoredController = this.controllers.get(identifier);
                if (StoredController != null) {
                    element[identifier] = new StoredController(identifier, element);
                }
            }
        }
        handleChanges(element, attributeName, newValue, oldValue) {
            const identifiers = this.getAttributes(oldValue, newValue);
            for (let index = 0; index < identifiers.length; index += 1) {
                this.toggleAttributes(element, identifiers[index], index === 0);
            }
        }
        removeController(element, identifier) {
            const controller = element[identifier];
            if (controller == null) {
                return;
            }
            controller.context.observer.disconnect();
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete element[identifier];
        }
        toggleAttributes(element, identifiers, added) {
            for (const identifier of identifiers) {
                if (added) {
                    this.addController(element, identifier);
                }
                else {
                    this.removeController(element, identifier);
                }
            }
        }
    }

    class Application {
        constructor() {
            this.controllers = new Map();
            this.observer = new DocumentObserver(this.controllers);
        }
        add(name, controller) {
            this.controllers.set(name, controller);
        }
        start() {
            this.observer.observe();
            this.observer.handleNodes(document.documentElement.childNodes, true);
        }
        stop() {
            this.observer.disconnect();
        }
    }

    class ControllerObserver extends Observer {
        constructor(controller) {
            super(controller.identifier, controller.element);
            this.controller = controller;
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
            [this.attributeAction, this.attributeTarget]
                .forEach((attribute) => {
                this.handleAttribute(element, attribute, '', !added);
            });
        }
        handleAction(element, action, added) {
            if (this.controller.context.store.actions.has(action)) {
                if (added) {
                    this.controller.context.store.actions.add(action, element);
                }
                else {
                    this.controller.context.store.actions.remove(action, element);
                }
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
            const attributes = this.getAttributes(oldValue, newValue);
            for (let index = 0; index < attributes.length; index += 1) {
                this.toggleAttributes(element, attributes[index], callback, index === 0);
            }
        }
        handleTarget(element, target, added) {
            if (added) {
                this.controller.context.store.targets.add(target, element);
            }
            else {
                this.controller.context.store.targets.remove(target, element);
            }
        }
        toggleAttributes(element, attributes, callback, added) {
            for (const attribute of attributes) {
                callback.call(this, element, attribute, added);
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
        constructor(identifier, element) {
            this.identifier = identifier;
            this.element = element;
            this.context = {
                observer: new ControllerObserver(this),
                store: new Store(),
            };
            this.context.observer.observe();
            this.context.observer.handleNodes(this.element.childNodes, true);
            this.connect();
        }
        connect() { }
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
