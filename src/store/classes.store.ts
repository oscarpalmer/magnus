export interface ClassNames {
  [name: string]: string;
}

export class ClassesStore {
  readonly values: ClassNames = {};

  set(name: string, value: string): void {
    if (value == null || value === '') {
      delete this.values[name];
    } else {
      this.values[name] = value;
    }
  }
}