import Magnus from './magnus';

// TODO: handle Magnus events and user-defined events
export default class Events {
  private readonly magnus: Magnus;

  constructor (magnus: Magnus) {
    this.magnus = magnus;
  }
}
