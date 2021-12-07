import { Context } from '../controller/context';
import { ActionStore } from './action.store';
import { ClassesStore } from './classes.store';
import { DataStore } from './data.store';
import { TargetStore } from './target.store';

export class Store {
  readonly actions: ActionStore;
  readonly classes: ClassesStore;
  readonly data: DataStore;
  readonly targets: TargetStore;

  constructor(context: Context) {
    this.actions = new ActionStore();
    this.classes = new ClassesStore();
    this.data = new DataStore(context);
    this.targets = new TargetStore(context);
  }
}
