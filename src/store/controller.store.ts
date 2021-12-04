import { StoredController } from '../models';
import { Application } from '../application';
import { Context } from '../context';
import { Controller, Constructor } from '../controller';

export class ControllerStore {
  private readonly controllers: Map<string, StoredController>;

  constructor(private readonly application: Application) {
    this.controllers = new Map();
  }

  add(identifier: string, element: Element): void {
    const storedController: StoredController | undefined = this.controllers.get(identifier);

    if (storedController != null) {
      storedController.instances.set(element, (new Context(this.application, identifier, element, storedController.constructor)).controller);
    }
  }

  create(identifier: string, constructor: Constructor): void {
    if (!this.controllers.has(identifier)) {
      this.controllers.set(identifier, { constructor, instances: new Map(), });
    }
  }

  remove(identifier: string, element: Element): void {
    const blob: StoredController | undefined = this.controllers.get(identifier);

    if (blob == null) {
      return;
    }

    const instance: Controller | undefined = blob.instances.get(element);

    if (instance == null) {
      return;
    }

    instance.context.observer.stop();

    instance.context.store.actions.clear();
    instance.context.store.targets.clear();

    blob.instances.delete(element);

    if (typeof instance.disconnect === 'function') {
      instance.disconnect();
    }
  }
}
