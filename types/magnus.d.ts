import type { ControllerConstructor } from './controller/index';
type Magnus = {
    add(name: string, ctor: ControllerConstructor): void;
    remove(name: string): void;
    start(): void;
    stop(): void;
};
declare const _default: Magnus;
export default _default;