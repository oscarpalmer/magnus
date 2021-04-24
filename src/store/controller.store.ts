import { Application } from '../application';
import { Context } from '../context';
import { Controller, ControllerConstructor } from '../controller';

export interface ControllerBlob {
  controllerConstructor: ControllerConstructor
  instances: Map<Element, Controller>
}

export class ControllerStore {
  private readonly controllers: Map<string, ControllerBlob>;

  constructor (private readonly application: Application) {
    this.controllers = new Map();
  }

  add (identifier: string, element: Element): void {
    const blob: ControllerBlob|undefined = this.controllers.get(identifier);

    if (blob == null) {
      return;
    }

    const context = new Context(this.application, identifier, element, blob.controllerConstructor);

    (element as any)[identifier] = context.controller;

    blob.instances.set(element, context.controller);
  }

  create (identifier: string, controllerConstructor: ControllerConstructor): void {
    if (!this.controllers.has(identifier)) {
      this.controllers.set(identifier, {
        controllerConstructor,
        instances: new Map(),
      });
    }
  }

  get (identifier: string): Controller[] {
    return Array.from(this.controllers.get(identifier)?.instances.values() ?? []);
  }

  remove (identifier: string, element: Element): void {
    const blob: ControllerBlob|undefined = this.controllers.get(identifier);

    if (blob == null) {
      return;
    }

    const instance: Controller|undefined = blob.instances.get(element);

    if (instance == null) {
      return;
    }

    instance.context.observer.stop();

    instance.context.store.actions.clear();
    instance.context.store.targets.clear();

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (element as any)[identifier];

    blob.instances.delete(element);
  }
}
