import {DataChange, Dispatch, TargetChange} from '../models';
import {Context} from './context';

class Emitter<EmittedModel> {
  protected callback?: (value: EmittedModel) => void;

  constructor(protected readonly context: Context) {}

  listen(callback: (value: EmittedModel) => void): void {
    this.callback = callback;
  }

  emit(value: EmittedModel): void {
    this.callback?.call(this.context.controller, value);
  }
}

export class Events {
  readonly data: Emitter<DataChange> = new Emitter(this.context);
  readonly target: Emitter<TargetChange> = new Emitter(this.context);

  constructor(protected readonly context: Context) {}

  dispatch(name: string, event?: Dispatch): void {
    (event?.target ?? this.context.element).dispatchEvent(new CustomEvent(name, {
      bubbles: event?.options?.bubbles ?? false,
      cancelable: event?.options?.cancelable ?? false,
      composed: event?.options?.composed ?? false,
      detail: event && event.data,
    }));
  }
}
