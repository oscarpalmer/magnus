import type { AttributeType, ParsedAttribute } from '../models';
export declare function getAttributeType(name: string): AttributeType | undefined;
export declare function parseAttribute(type: AttributeType, name: string, value: string): ParsedAttribute | undefined;
