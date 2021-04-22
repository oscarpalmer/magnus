import { Application } from '../application';
import { Controller, ControllerConstructor } from '../controller';

export interface ControllerBlob {
  controller: ControllerConstructor
  instances: Map<HTMLElement, Controller>
}

export class ControllerStore {
  private readonly application: Application;
  private readonly store: Map<string, ControllerBlob>;

  constructor (application: Application) {
    this.application = application;

    this.store = new Map();
  }

  add (identifier: string, element: HTMLElement): void {
    const blob: ControllerBlob|undefined = this.store.get(identifier);

    if (blob == null) {
      return;
    }

    // eslint-disable-next-line new-cap
    const instance: Controller = new blob.controller(this.application, identifier, element);

    (element as any)[identifier] = instance;

    blob.instances.set(element, instance);
  }

  create (identifier: string, controller: ControllerConstructor): void {
    if (!this.store.has(identifier)) {
      this.store.set(identifier, {
        controller,
        instances: new Map(),
      });
    }
  }

  get (identifier: string): Controller[] {
    return Array.from(this.store.get(identifier)?.instances.values() ?? []);
  }

  remove (identifier: string, element: HTMLElement): void {
    const blob: ControllerBlob|undefined = this.store.get(identifier);

    if (blob == null || !blob.instances.has(element)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (element as any)[identifier];

    blob.instances.delete(element);
  }
}
