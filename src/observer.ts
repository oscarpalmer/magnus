import Magnus from './magnus';

export default class Observer {
  private static readonly MUTATION_OBSERVER_OPTIONS: MutationObserverInit = {
    childList: true,
    subtree: true,
  };

  private readonly magnus: Magnus;
  private readonly mutationObserver: MutationObserver;

  constructor (magnus: Magnus) {
    this.magnus = magnus;

    this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));

    this.mutationObserver.observe(document.documentElement, Observer.MUTATION_OBSERVER_OPTIONS);
  }

  handleNodes (nodes: NodeList, added: boolean): void {
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

  observeMutations (entries: MutationRecord[]): void {
    for (const entry of entries) {
      this.handleNodes(entry.addedNodes, true);
      this.handleNodes(entry.removedNodes, false);
    }
  }
}
