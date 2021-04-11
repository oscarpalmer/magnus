import { ActionStore } from './action.store';
import { TargetStore } from './target.store';

export class Store {
  readonly actions: ActionStore;
  readonly targets: TargetStore;

  constructor () {
    this.actions = new ActionStore();
    this.targets = new TargetStore();
  }
}
