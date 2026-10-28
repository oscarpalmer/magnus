import type {Context, Targets} from '../models';

// #region Instances

function Targets(this: any, context: Context): void {
	this.context = context;
	this.store = new Map();
}

Targets.prototype.add = addTarget;
Targets.prototype.clear = clearTargets;
Targets.prototype.find = findTarget;
Targets.prototype.findAll = findAllTargets;
Targets.prototype.get = getTarget;
Targets.prototype.getAll = getAllTargets;
Targets.prototype.has = hasTarget;
Targets.prototype.remove = removeTarget;

// #endregion

// #region Functions

function addTarget(this: Targets, name: string, element: Element): void {
	let targets = this.store.get(name);

	if (targets == null) {
		targets = new Set();

		this.store.set(name, targets);
	}

	targets.add(element);
}

function clearTargets(this: Targets): void {
	const targets = [...this.store.values()];
	const {length} = targets;

	for (let index = 0; index < length; index += 1) {
		targets[index].clear();
	}

	this.store.clear();
}

export function createTargets(context: Context): Targets {
	// @ts-expect-error All good, no worries :-)
	return new Targets(context);
}

function findTarget(this: Targets, selector: string): Element | null {
	return typeof selector === 'string' ? this.context.state.element.querySelector(selector) : null;
}

function findAllTargets(this: Targets, selector: string): Element[] {
	return typeof selector === 'string'
		? [...this.context.state.element.querySelectorAll(selector)]
		: [];
}

function getTarget(this: Targets, name: string): Element | undefined {
	return getAllTargets.call(this, name)[0];
}

function getAllTargets(this: Targets, name: string): Element[] {
	return [...(this.store.get(name) ?? [])];
}

function hasTarget(this: Targets, name: string): boolean {
	return (this.store.get(name)?.size ?? 0) > 0;
}

function removeTarget(this: Targets, name: string, element: Element): void {
	this.store.get(name)?.delete(element);
}

// #endregion
