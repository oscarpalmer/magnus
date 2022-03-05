import {Context} from '../controller/context';
import {ActionStore} from './action.store';
import {DataStore} from './data.store';
import {TargetStore} from './target.store';

export class Store {
  readonly actions: ActionStore;
  readonly data: DataStore;
  readonly targets: TargetStore;

  constructor(context: Context) {
    this.actions = new ActionStore();
    this.data = new DataStore(context);
    this.targets = new TargetStore(context);
  }
}
