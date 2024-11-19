export declare class Observer {
    private readonly observer;
    private readonly options;
    private running;
    constructor();
    start(): void;
    stop(): void;
    update(): void;
}
declare const observer: Observer;
export { observer };
