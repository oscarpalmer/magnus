import type {ControllerConstructor} from '../models';
import observer from '../observer/index';
import {Actions} from '../store/action.store';
import {Data} from '../store/data.store';
import {Targets} from '../store/target.store';
import {Events} from './events';

export class Context {
	readonly actions: Actions;
	readonly controller: InstanceType<ControllerConstructor>;
	readonly data: Data;
	readonly events: Events;
	readonly targets: Targets;

	constructor(
		readonly name: string,
		readonly element: Element,
		creator: ControllerConstructor,
	) {
		this.actions = new Actions();
		this.data = new Data(this);
		this.events = new Events(this);
		this.targets = new Targets(this);

		this.controller = new creator(this);

		observer.update();

		this.controller.connect?.();
	}
}
