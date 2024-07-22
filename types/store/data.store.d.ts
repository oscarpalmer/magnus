import type { PlainObject } from '@oscarpalmer/atoms/models';
import type { Context } from '../controller/context';
export type Data = {
    value: PlainObject;
};
export declare function createData(identifier: string, context: Context): Data;
