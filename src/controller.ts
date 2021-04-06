import { ControllerObserver } from './observer/controller.observer';
import { IObserver } from './observer/observer';
import { Store } from './store';

export type ControllerConstructor = new(...params: any[]) => Controller;

export class Controller {
  private readonly observer: IObserver;
  private readonly store: Store;

  readonly element: HTMLElement;
  readonly identifier: string;

  constructor (identifier: string, element: HTMLElement) {
    this.identifier = identifier;
    this.element = element;

    this.store = new Store();
    this.observer = new ControllerObserver(this, this.store);

    this.observer.observe();
    this.observer.handleNodes(this.element.childNodes, true);
  }

  elements (name: string): HTMLElement[] {
    return this.store.getElements(name);
  }
}
