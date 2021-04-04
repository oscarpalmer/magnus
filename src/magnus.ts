import Observer from './observer';
import Store from './store';

export default class Magnus {
  private readonly observer: Observer;
  private readonly store: Store;

  constructor () {
    this.store = new Store();
    this.observer = new Observer('magnus', document.documentElement, this.store);
  }

  get actions (): Map<string, Function> {
    return this.store.actions;
  }

  start (): void {
    this.observer.observe();
    this.observer.handleNodes(document.documentElement.childNodes, true);
  }

  stop (): void {
    this.observer.disconnect();
  }

  targets (key: string): HTMLElement[] {
    return this.store.getElements(key);
  }
}
