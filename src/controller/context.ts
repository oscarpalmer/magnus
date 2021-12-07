import { IObserver } from '../models';
import { Application } from '../application';
import { ControllerObserver } from '../observer/controller.observer';
import { Store } from '../store/store';
import { Controller, Constructor } from './controller';
import { Events } from './events';
import { Targets } from './targets';

export class Context {
  readonly controller: Controller;
  readonly events: Events;
  readonly observer: IObserver;
  readonly store: Store;
  readonly targets: Targets;

  constructor(
    readonly application: Application,
    readonly identifier: string,
    readonly element: Element,
    controller: Constructor,
  ) {
    this.events = new Events(this);
    this.store = new Store(this);
    this.targets = new Targets(this);

    this.observer = new ControllerObserver(this);
    this.controller = new controller(this);

    this.observer.start();

    if (this.controller.connect != null) {
      this.controller.connect();
    }
  }
}
