/*!
 * Magnus, v0.5.0
 * https://github.com/oscarpalmer/magnus
 * (c) Oscar Palmér, 2021, MIT @license
 */
var Magnus = (function () {
    'use strict';

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

    class ControllerObserver extends Observer {
        constructor(controller, store) {
            super(controller.identifier, controller.element);
            this.controller = controller;
            this.store = store;
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
            this.handleAttributeChanges(element, oldValue, newValue, callback);
        }
        handleElement(element, added) {
            if (element.hasAttribute(this.attributeAction)) {
                this.handleAttribute(element, this.attributeAction, '', !added);
            }
            if (element.hasAttribute(this.attributeTarget)) {
                this.handleAttribute(element, this.attributeTarget, '', !added);
            }
        }
        handleAction(element, action, added) {
            if (this.store.hasAction(action)) {
                if (added) {
                    this.store.addAction(action, element);
                }
                else {
                    this.store.removeAction(action, element);
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
                this.store.createAction(action, parts[0], callback.bind(this.controller));
                this.store.addAction(action, element);
            }
        }
        handleAttributeChanges(element, oldValue, newValue, callback) {
            const attributes = this.getAttributes(oldValue, newValue);
            for (let index = 0; index < attributes.length; index += 1) {
                this.toggleAttributes(element, attributes[index], callback, index === 0);
            }
        }
        handleTarget(element, target, added) {
            if (added) {
                this.store.addElement(target, element);
            }
            else {
                this.store.removeElement(target, element);
            }
        }
        toggleAttributes(element, attributes, callback, added) {
            for (const attribute of attributes) {
                callback.call(this, element, attribute, added);
            }
        }
    }

    class Store {
        constructor() {
            this.actions = new Map();
            this.elements = new Map();
        }
        addAction(key, element) {
            const action = this.actions.get(key);
            if (action == null) {
                return;
            }
            action.elements.add(element);
            element.addEventListener(action.type, action.callback);
        }
        addElement(key, element) {
            var _a, _b;
            if (this.elements.has(key)) {
                (_a = this.elements.get(key)) === null || _a === void 0 ? void 0 : _a.add(element);
            }
            else {
                (_b = this.elements.set(key, new Set()).get(key)) === null || _b === void 0 ? void 0 : _b.add(element);
            }
        }
        createAction(key, type, callback) {
            if (!this.actions.has(key)) {
                this.actions.set(key, {
                    callback,
                    elements: new Set(),
                    type,
                });
            }
        }
        getElements(key) {
            const elements = this.elements.get(key);
            return elements != null
                ? Array.from(elements)
                : [];
        }
        hasAction(key) {
            return this.actions.has(key);
        }
        removeAction(key, element) {
            const action = this.actions.get(key);
            if (action == null) {
                return;
            }
            element.removeEventListener(action.type, action.callback);
            action.elements.delete(element);
            if (action.elements.size === 0) {
                this.actions.delete(key);
            }
        }
        removeElement(key, element) {
            var _a, _b;
            if (this.elements.has(key)) {
                (_a = this.elements.get(key)) === null || _a === void 0 ? void 0 : _a.delete(element);
                if (((_b = this.elements.get(key)) === null || _b === void 0 ? void 0 : _b.size) === 0) {
                    this.elements.delete(key);
                }
            }
        }
    }

    class Controller {
        constructor(identifier, element) {
            this.identifier = identifier;
            this.element = element;
            this.store = new Store();
            this.observer = new ControllerObserver(this, this.store);
            this.observer.observe();
            this.observer.handleNodes(this.element.childNodes, true);
            this.connect();
        }
        connect() { }
        elements(name) {
            return this.store.getElements(name);
        }
    }

    class DocumentObserver extends Observer {
        constructor(controllers) {
            super('magnus', document.documentElement);
            this.controllers = controllers;
        }
        handleAttribute(element, attributeName, oldValue) {
            var _a;
            const newValue = (_a = element.getAttribute(attributeName)) !== null && _a !== void 0 ? _a : '';
            if (attributeName === Observer.CONTROLLER_ATTRIBUTE && newValue !== oldValue) {
                this.handleControllerChanges(element, attributeName, newValue, oldValue);
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
        addControllerToElement(element, identifier) {
            if (this.controllers.has(identifier) && element[identifier] == null) {
                const StoredController = this.controllers.get(identifier);
                if (StoredController != null) {
                    element[identifier] = new StoredController(identifier, element);
                }
            }
        }
        handleControllerChanges(element, attributeName, newValue, oldValue) {
            const identifiers = this.getAttributes(oldValue, newValue);
            for (let index = 0; index < identifiers.length; index += 1) {
                this.toggleAttributes(element, identifiers[index], index === 0);
            }
        }
        removeControllerFromElement(element, identifier) {
            const controller = element[identifier];
            if (controller == null) {
                return;
            }
            // @ts-expect-error
            controller.observer.disconnect();
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete element[identifier];
        }
        toggleAttributes(element, identifiers, added) {
            for (const identifier of identifiers) {
                if (added) {
                    this.addControllerToElement(element, identifier);
                }
                else {
                    this.removeControllerFromElement(element, identifier);
                }
            }
        }
    }

    class Magnus {
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
    Magnus.Controller = Controller;

    return Magnus;

}());
