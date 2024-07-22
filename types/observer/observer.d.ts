export type Observer = {
    handleElement(element: Element, added: boolean): void;
    handleNodes(nodes: NodeList | Node[], added: boolean): void;
    start(): void;
    stop(): void;
    update(): void;
};
export declare const options: MutationObserverInit;
export declare function createObserver(element: Element, options: MutationObserverInit, attributeHandler: (element: Element, name: string, value: string, added: boolean) => void): Observer;
