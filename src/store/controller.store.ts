import { StoredController } from '../models';
import { Application } from '../application';
import { Context } from '../controller/context';
import { Constructor } from '../controller/controller';

export class ControllerStore {
  private readonly controllers: Map<string, StoredController>;

  constructor(private readonly application: Application) {
    this.controllers = new Map();
  }

  add(identifier: string, element: Element): void {
    const controller: StoredController|undefined = this.controllers.get(identifier);

    if (controller != null) {
      controller.instances.set(element, new Context(this.application, identifier, element, controller.constructor));
    }
  }

  create(identifier: string, constructor: Constructor): void {
    if (!this.controllers.has(identifier)) {
      this.controllers.set(identifier, { constructor, instances: new Map(), });
    }
  }

  remove(identifier: string, element: Element): void {
    const controller: StoredController|undefined = this.controllers.get(identifier);

    if (controller == null) {
      return;
    }

    const instance: Context|undefined = controller.instances.get(element);

    if (instance == null) {
      return;
    }

    instance.observer.stop();

    instance.store.actions.clear();
    instance.store.targets.clear();

    controller.instances.delete(element);

    if (typeof instance.controller.disconnect === 'function') {
      instance.controller.disconnect();
    }
  }
}
