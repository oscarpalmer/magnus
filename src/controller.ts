import { Application } from './application';
import { ControllerObserver } from './observer/controller.observer';
import { IObserver } from './observer/observer';
import { Store } from './store/store';

export interface Context {
  application: Application
  observer: IObserver
  store: Store
}

export type ControllerConstructor = new(application: Application, identifier: string, element: HTMLElement) => Controller;

export class Controller {
  readonly context: Context;
  readonly element: HTMLElement;
  readonly identifier: string;

  constructor (application: Application, identifier: string, element: HTMLElement) {
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

  connect (): void {}

  hasTarget (name: string): boolean {
    return this.context.store.targets.has(name);
  }

  target (name: string): HTMLElement|undefined {
    return this.targets(name)[0];
  }

  targets (name: string): HTMLElement[] {
    return this.context.store.targets.get(name);
  }
}
