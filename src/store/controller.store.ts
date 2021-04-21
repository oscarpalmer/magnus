import { Controller, ControllerConstructor } from '../controller';

export interface ControllerBlob {
  controller: ControllerConstructor
  instances: Map<HTMLElement, Controller>
}

export class ControllerStore {
  private readonly store: Map<string, ControllerBlob>;

  constructor () {
    this.store = new Map();
  }

  add (identifier: string, element: HTMLElement): void {
    const blob: ControllerBlob|undefined = this.store.get(identifier);

    if (blob == null) {
      return;
    }

    // eslint-disable-next-line new-cap
    const instance: Controller = new blob.controller(identifier, element);

    (element as any)[identifier] = instance;

    blob.instances.set(element, instance);
  }

  create (identifier: string, controller: ControllerConstructor): void {
    this.store.set(identifier, {
      controller,
      instances: new Map(),
    });
  }

  get (identifier: string): any[] {
    const blob: ControllerBlob|undefined = this.store.get(identifier);

    if (blob == null) {
      return [];
    }

    return Array.from(blob.instances.values());
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
