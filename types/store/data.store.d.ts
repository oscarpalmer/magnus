import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { Context } from '../controller/context';
import { ControllerDataType, ControllerDataTypes } from '../models';
export declare class Data {
    readonly types: ControllerDataTypes;
    readonly value: PlainObject;
    constructor(context: Context, types: ControllerDataTypes);
}
export declare function getDataValue(type: ControllerDataType, original: string): unknown;
export declare function replaceData(context: Context, value: unknown): void;
export declare function setValueFromAttribute(context: Context, name: string, value: string): void;
