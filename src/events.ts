import { Context } from './context';
import { DataChange, Dispatch, TargetChange } from './models';

class Emitter<T> {
  protected callback?: (value: T) => void;

  constructor(protected readonly context: Context) {}

  listen(callback: (value: T) => void): void {
    this.callback = callback;
  }

  emit(value: T): void {
    if (this.callback != null) {
      this.callback.call(this.context.controller, value);
    }
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
      detail: event?.data,
    }));
  }
}
