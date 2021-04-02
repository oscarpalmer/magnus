/*!
 * Magnus, v0.2.0
 * https://github.com/oscarpalmer/magnus
 * (c) Oscar Palmér, 2021, MIT @license
 */
var magnus = (function () {
    'use strict';

    // TODO: handle Magnus events and user-defined events
    class Events {
        constructor(magnus) {
            this.magnus = magnus;
        }
    }

    class Observer {
        constructor(magnus) {
            this.magnus = magnus;
            this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
            this.mutationObserver.observe(document.documentElement, Observer.MUTATION_OBSERVER_OPTIONS);
        }
        handleNodes(nodes, added) {
            if (nodes == null || nodes.length === 0) {
                return;
            }
            for (const node of nodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }
                // TODO: handle callbacks, input and output elements
            }
        }
        observeMutations(entries) {
            for (const entry of entries) {
                this.handleNodes(entry.addedNodes, true);
                this.handleNodes(entry.removedNodes, false);
            }
        }
    }
    Observer.MUTATION_OBSERVER_OPTIONS = {
        childList: true,
        subtree: true,
    };

    // Handle stored elements and data (Proxy?)
    class Store {
        constructor(magnus) {
            this.magnus = magnus;
        }
    }

    class Magnus {
        constructor() {
            this.events = new Events(this);
            this.observer = new Observer(this);
            this.store = new Store(this);
        }
    }

    var index = () => {
        return new Magnus();
    };

    return index;

}());
