import { ControllerStore } from './store/controller.store';
import { Controller, ControllerConstructor } from './controller';
import { DocumentObserver } from './observer/document.observer';
import { IObserver } from './observer/observer';

export class Application {
  private readonly observer: IObserver;
  private readonly store: ControllerStore;

  constructor () {
    this.store = new ControllerStore();
    this.observer = new DocumentObserver(this.store);
  }

  add (name: string, controller: ControllerConstructor): void {
    this.store.create(name, controller);
  }

  get (name: string): Controller[] {
    return this.store.get(name);
  }

  start (): void {
    this.observer.observe();
    this.observer.handleNodes(document.documentElement.childNodes, true);
  }

  stop (): void {
    this.observer.disconnect();
  }
}
