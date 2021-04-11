import { ControllerObserver } from './observer/controller.observer';
import { IObserver } from './observer/observer';
import { Store } from './store/store';

interface Context {
  observer: IObserver
  store: Store
}

export type ControllerConstructor = new(identifier: string, element: HTMLElement) => Controller;

export class Controller {
  readonly context: Context;
  readonly element: HTMLElement;
  readonly identifier: string;

  constructor (identifier: string, element: HTMLElement) {
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

  connect (): void {}

  target (name: string): HTMLElement {
    return this.targets(name)[0];
  }

  targets (name: string): HTMLElement[] {
    return this.context.store.targets.get(name);
  }
}
