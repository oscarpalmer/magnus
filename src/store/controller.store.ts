import { Application } from '../application';
import { Context } from '../context';
import { Controller, ControllerConstructor } from '../controller';

export interface ControllerBlob {
  controllerConstructor: ControllerConstructor;
  instances: Map<Element, Controller>;
}

export class ControllerStore {
  private readonly controllers: Map<string, ControllerBlob>;

  constructor(private readonly application: Application) {
    this.controllers = new Map();
  }

  add(identifier: string, element: Element): void {
    const blob: ControllerBlob | undefined = this.controllers.get(identifier);

    if (blob != null) {
      blob.instances.set(element, (new Context(this.application, identifier, element, blob.controllerConstructor)).controller);
    }
  }

  create(identifier: string, controllerConstructor: ControllerConstructor): void {
    if (!this.controllers.has(identifier)) {
      this.controllers.set(identifier, {
        controllerConstructor,
        instances: new Map(),
      });
    }
  }

  remove(identifier: string, element: Element): void {
    const blob: ControllerBlob | undefined = this.controllers.get(identifier);

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
