import {KeyValueStore} from '../models';
import {Context} from './context';
import {Events} from './events'
import {Targets} from './targets';

export type Constructor = new (context: Context) => Controller;

export interface Controller {
  connect?(): void;
  disconnect?(): void;
}

export abstract class Controller<DataModel = KeyValueStore<unknown>> {
  constructor (private readonly context: Context) {}

  get data(): DataModel {
    return (this.context.store.data.proxy as unknown) as DataModel;
  }

  get element(): Element {
    return this.context.element;
  }

  get events(): Events {
    return this.context.events;
  }

  get identifier(): string {
    return this.context.identifier;
  }

  get targets(): Targets {
    return this.context.targets;
  }
}
