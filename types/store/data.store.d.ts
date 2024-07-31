import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { Context } from '../controller/context';
export declare class Data {
    readonly value: PlainObject;
    constructor(context: Context);
}
export declare function setValueFromAttribute(context: Context, name: string, value: string): void;
