import { Application } from './application';
import { Controller, ControllerConstructor } from './controller';
import { ControllerObserver } from './observer/controller.observer';
import { IObserver } from './observer/observer';
import { Store } from './store/store';

export class Context {
  readonly controller: Controller;
  readonly observer: IObserver;
  readonly store: Store;

  constructor (
    readonly application: Application,
    readonly identifier: string,
    readonly element: Element,
    ControllerConstructor: ControllerConstructor,
  ) {
    this.store = new Store();
    this.observer = new ControllerObserver(this);

    this.controller = new ControllerConstructor(this);

    this.observer.start();
    this.controller.connect();
  }

  findElement (selector: string): Element|null {
    return this.element.querySelector(selector);
  }

  findElements (selector: string): Element[] {
    return Array.from(this.element.querySelectorAll(selector));
  }
}
