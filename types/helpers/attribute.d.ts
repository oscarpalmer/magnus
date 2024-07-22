type ParsedAttribute = {
    controller: string;
    identifier: string | null;
    name: string;
};
export declare const actionAttributePattern: RegExp;
export declare function parseAttribute(type: 'action' | 'target', value: string): ParsedAttribute | undefined;
export {};
