import Magnus from './magnus';

// Handle stored elements and data (Proxy?)
export default class Store {
  private readonly magnus: Magnus;

  constructor (magnus: Magnus) {
    this.magnus = magnus;
  }
}
