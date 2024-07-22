export type EventParameters = {
    callback: string;
    options: AddEventListenerOptions;
    type: string;
};
export declare function getEventParameters(element: Element, action: string): EventParameters | undefined;
