import { KeyValueStore } from '../models';

export class ClassesStore {
  readonly values: KeyValueStore<string> = {};

  set(name: string, value: string): void {
    if (value == null || value === '') {
      delete this.values[name];
    } else {
      this.values[name] = value;
    }
  }
}