import type {ControllerConstructor} from '../models';
import {Actions} from '../store/action.store';
import {contexts} from '../store/context.store';
import type {StoredController} from '../store/controller.store';
import {Data} from '../store/data.store';
import {Targets} from '../store/target.store';
import {Events} from './events';

export class Context {
	readonly actions: Actions;
	readonly controller: InstanceType<ControllerConstructor>;
	readonly data: Data;
	readonly events: Events;
	readonly state: State;
	readonly targets: Targets;

	constructor(name: string, element: Element, controller: StoredController) {
		this.state = {element, name};

		this.actions = new Actions();
		this.data = new Data(this, controller.types);
		this.events = new Events(this);
		this.targets = new Targets(this);

		contexts.connect(element, this);

		this.controller = new controller.ctor(this);

		this.controller.connect?.();
	}
}

type State = {
	name: string;
	element: Element;
};
