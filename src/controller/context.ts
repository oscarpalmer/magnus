import type {ControllerConstructor} from '../models';
import type {Observer} from '../observer';
import {handleAttributes} from '../observer/attributes';
import {observeController} from '../observer/controller.observer';
import {Actions} from '../store/action.store';
import {Data} from '../store/data.store';
import {Targets} from '../store/target.store';
import {Events} from './events';

export class Context {
	readonly actions: Actions;
	readonly controller: InstanceType<ControllerConstructor>;
	readonly data: Data;
	readonly events: Events;
	readonly observer: Observer;
	readonly targets: Targets;

	constructor(
		readonly name: string,
		readonly element: Element,
		ctor: ControllerConstructor,
	) {
		this.actions = new Actions();
		this.data = new Data(this);
		this.events = new Events(this);
		this.observer = observeController(name, element);
		this.targets = new Targets(this);

		this.controller = new ctor(this);

		handleAttributes(this);

		this.controller.connect?.();
	}
}
