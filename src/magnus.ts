import Events from './events';
import Observer from './observer';
import Store from './store';

export default class Magnus {
  readonly events: Events;
  readonly observer: Observer;
  readonly store: Store;

  constructor () {
    this.events = new Events(this);
    this.observer = new Observer(this);
    this.store = new Store(this);
  }
}
