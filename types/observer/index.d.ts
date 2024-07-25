type Observer = {
    start(): void;
    stop(): void;
    update(): void;
};
export declare function createObserver(): Observer;
export {};
