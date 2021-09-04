import { ControllerStore } from './store/controller.store';
import { ControllerConstructor } from './controller';
import { DocumentObserver } from './observer/document.observer';

export class Application {
  private readonly controllers: ControllerStore;
  private readonly observer: DocumentObserver;

  constructor() {
    this.controllers = new ControllerStore(this);
    this.observer = new DocumentObserver(this.controllers);
  }

  add(name: string, controller: ControllerConstructor): void {
    this.controllers.create(name, controller);
  }

  start(): void {
    this.observer.start();
  }

  stop(): void {
    this.observer.stop();
  }
}
