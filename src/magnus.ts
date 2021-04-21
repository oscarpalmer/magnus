import { Controller, ControllerConstructor } from './controller';
import { DocumentObserver } from './observer/document.observer';
import { IObserver } from './observer/observer';

export class Magnus {
  static Controller = Controller;

  private readonly controllers: Map<string, ControllerConstructor>;
  private readonly observer: IObserver;

  constructor () {
    this.controllers = new Map();
    this.observer = new DocumentObserver(this.controllers);
  }

  add (name: string, controller: ControllerConstructor): void {
    this.controllers.set(name, controller);
  }

  start (): void {
    this.observer.observe();
    this.observer.handleNodes(document.documentElement.childNodes, true);
  }

  stop (): void {
    this.observer.disconnect();
  }
}
