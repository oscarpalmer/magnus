import type {ControllerConstructor, ControllerDataTypes} from '../models';
import {Actions} from '../store/action.store';
import {contexts} from '../store/context.store';
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

	constructor(name: string, element: Element, creator: ControllerConstructor) {
		this.state = {element, name};

		this.actions = new Actions();
		this.data = new Data(this, ((creator as any).types ?? {}) as ControllerDataTypes);
		this.events = new Events(this);
		this.targets = new Targets(this);

		contexts.connect(element, this);

		this.controller = new creator(this);

		this.controller.connect?.();
	}
}

type State = {
	name: string;
	element: Element;
};
