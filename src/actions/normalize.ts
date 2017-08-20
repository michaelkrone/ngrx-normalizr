import { Action } from '@ngrx/store';
import { schema } from 'normalizr';

const ACION_NAMESPACE = '[@@Normalize]';

export interface SchemaMap {
	[schemaKey: string]: string;
}

export interface SchemaPayload {
	schema: schema.Entity;
}

export interface NormalizeSetDataPayload<T> extends SchemaPayload {
	data: T[];
}

export interface NormalizeRemovePayload extends SchemaPayload {
	id: string;
	removeChildren?: SchemaMap;
}

export class NormalizeActionTypes {
	static readonly SET_DATA = `${ACION_NAMESPACE} Set Data`;
	static readonly REMOVE_DATA = `${ACION_NAMESPACE} Remove Data`;
}

export class SetData<T> implements Action {
	readonly type = NormalizeActionTypes.SET_DATA;
	constructor(public payload: NormalizeSetDataPayload<T>) {}
}

export class RemoveData implements Action {
	readonly type = NormalizeActionTypes.REMOVE_DATA;
	constructor(public payload: NormalizeRemovePayload) {}
}
