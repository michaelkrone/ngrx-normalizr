/**
 * Exports actions and an actionCreators creator of the ngrx-normalizr package.
 */

import { Action } from '@ngrx/store';
import { schema } from 'normalizr';

/**
 * Internal action namespace
 */
const ACION_NAMESPACE = '[@@Normalize]';

/**
 * A map of schema names to object property names.
 * Used for removing child properties of an entity.
 */
export interface SchemaMap {
	[schemaKey: string]: string;
}

/**
 * Base interface for `SetData` and `RemoveData` action payload.
 */
export interface SchemaPayload {
	/**
   * Schema definition of the entity. Used for de-/ and normalizing given entities.
   */
	schema: schema.Entity;
}

/**
 * Typed Interface for the payload of the `SetData` action.
 * Accepts an typed array of entities to be added to the store.
 */
export interface NormalizeSetDataPayload<T> extends SchemaPayload {
	/**
   * The array of entities which should be normalized and added to the store.
   */
	data: T[];
}

/**
 * Interface for the payload of the `RemoveData` action.
 * Accepts an `id` and an optional `removeChildren` property.
 */
export interface NormalizeRemovePayload extends SchemaPayload {
	/**
   * The id of the entity that should be removed
   */
	id: string;

	/**
   * If set and maps to valid schema keys and propety names,
   * children referenced by the entity will be removed
   */
	removeChildren?: SchemaMap;
}

/**
 * All types of the provided actions.
 */
export class NormalizeActionTypes {
	/**
   * Action type of the `SetData` action.
   */
	static readonly SET_DATA = `${ACION_NAMESPACE} Set Data`;

	/**
   * Action type of the `RemoveData` action.
   */
	static readonly REMOVE_DATA = `${ACION_NAMESPACE} Remove Data`;
}

/**
 * Action for setting/updating data to the store.
 * Also see `NormalizeSetDataPayload`.
 */
export class SetData<T> implements Action {
	/**
   * The action type: `NormalizeActionTypes.SET_DATA`
   */
	readonly type = NormalizeActionTypes.SET_DATA;

	/**
   * SetData Constructor
   * @param payload The action payload used in the reducer
   */
	constructor(public payload: NormalizeSetDataPayload<T>) {}
}

/**
 * Action for removing data from the store.
 * Also see `NormalizeRemovePayload`.
 */
export class RemoveData implements Action {
	/**
   * The action type: `NormalizeActionTypes.REMOVE_DATA`
   */
	readonly type = NormalizeActionTypes.REMOVE_DATA;

	/**
   * RemoveData Constructor
   * @param payload The action payload used in the reducer
   */
	constructor(public payload: NormalizeRemovePayload) {}
}

/**
 * Create a set of action creators for the `SetData` and `RemoveData` actions.
 * This is provided for convenience.
 * @param schema The schema the action creators should be bound to
 */
export function actionCreators<T>(schema: schema.Entity) {
	return {
		/**
     * Action creator for the `SetData` action.
     * @returns A new instance of the `SetData` action with the given schema set.
     */
		setData: (data: NormalizeSetDataPayload<T>['data']) =>
			new SetData<T>({ data, schema }),

		/**
     * Action creator for the `RemoveData` action.
     * @returns A new instance of the `RemoveData` action with the given schema set.
     */
		removeData: (
			id: NormalizeRemovePayload['id'],
			removeChildren?: NormalizeRemovePayload['removeChildren']
		) => new RemoveData({ id, schema, removeChildren })
	};
}
