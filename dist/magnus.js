/*!
 * Magnus, v0.3.0
 * https://github.com/oscarpalmer/magnus
 * (c) Oscar Palmér, 2021, MIT @license
 */
var Magnus = (function () {
    'use strict';

    class Observer {
        constructor(identifier, element, store) {
            this.identifier = identifier;
            this.element = element;
            this.store = store;
            this.attributeAction = `data-${this.identifier}-action`;
            this.attributeTarget = `data-${this.identifier}-target`;
            this.mutationOptions = Observer.MUTATION_OBSERVER_OPTIONS;
            this.mutationOptions.attributeFilter = [
                this.attributeAction,
                this.attributeTarget,
            ];
            this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
        }
        disconnect() {
            this.mutationObserver.disconnect();
        }
        handleNodes(nodes, added) {
            if (nodes == null || nodes.length === 0) {
                return;
            }
            for (const node of nodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }
                const element = node;
                if (added && element.hasAttribute(this.attributeAction)) {
                    this.handleAction(element);
                }
                if (element.hasAttribute(this.attributeTarget)) {
                    this.handleTarget(element, added);
                }
                this.handleNodes(element.childNodes, added);
            }
        }
        observe() {
            this.mutationObserver.observe(this.element, Observer.MUTATION_OBSERVER_OPTIONS);
        }
        handleAction(element) {
            var _a;
            const attributeValue = (_a = element.getAttribute(this.attributeAction)) !== null && _a !== void 0 ? _a : '';
            const attributeParts = attributeValue.split(' ');
            attributeParts.forEach((part) => {
                const x = part.split(':');
                if (x.length < 2) {
                    return;
                }
                const callback = this.store.actions.get(x[1]);
                if (typeof callback === 'function') {
                    element.addEventListener(x[0], callback);
                }
            });
        }
        handleTarget(element, added) {
            var _a;
            const attributeValue = (_a = element.getAttribute(this.attributeTarget)) !== null && _a !== void 0 ? _a : '';
            const attributeParts = attributeValue.split(' ');
            attributeParts.forEach((part) => {
                if (added) {
                    this.store.addElement(part, element);
                }
                else {
                    this.store.removeElement(part, element);
                }
            });
        }
        observeMutations(entries) {
            for (const entry of entries) {
                // TODO: attribute changes
                this.handleNodes(entry.addedNodes, true);
                this.handleNodes(entry.removedNodes, false);
            }
        }
    }
    Observer.MUTATION_OBSERVER_OPTIONS = {
        attributeOldValue: true,
        attributes: true,
        childList: true,
        subtree: true,
    };

    class Store {
        constructor() {
            this.actions = new Map();
            this.elements = new Map();
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
        getElements(key) {
            const elements = this.elements.get(key);
            return elements != null
                ? Array.from(elements)
                : [];
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

    class Magnus {
        constructor() {
            this.store = new Store();
            this.observer = new Observer('magnus', document.documentElement, this.store);
        }
        get actions() {
            return this.store.actions;
        }
        start() {
            this.observer.observe();
            this.observer.handleNodes(document.documentElement.childNodes, true);
        }
        stop() {
            this.observer.disconnect();
        }
        targets(key) {
            return this.store.getElements(key);
        }
    }

    return Magnus;

}());
