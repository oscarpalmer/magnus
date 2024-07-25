export type EventParameters = {
    callback: string;
    external?: ExternalController;
    options: AddEventListenerOptions;
    type: string;
};
type ExternalController = {
    controller: string;
    identifier?: string;
};
export declare function getEventParameters(element: Element, action: string, isParent: boolean): EventParameters | undefined;
export {};
