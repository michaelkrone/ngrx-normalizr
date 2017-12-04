/**
 * Exports actions and an actionCreators creator of the ngrx-normalizr package.
 */

import { Action } from '@ngrx/store';
import { schema, normalize } from 'normalizr';
import { EntityMap } from '../reducers/normalize';

/**
 * Internal action namespace
 */
const ACTION_NAMESPACE = '[@@Normalize]';

/**
 * A map of schema names to object property names.
 * Used for removing child properties of an entity.
 */
export interface SchemaMap {
	[schemaKey: string]: string;
}

/**
 * Interface for a normalize action payload
 */
export interface NormalizeActionPayload {
	/**
	 * The normalized entities mapped to their schema keys
	 */
	entities: EntityMap;

	/**
	 * The original sorted id's as an array
	 */
	result: string[];
}

/**
 * Interface for a remove action payload
 */
export interface NormalizeRemoveActionPayload {
	/**
	 * The id of the entity that should be removed
	 */
	id: string;

	/**
	 * The schema key of the entity that should be removed
	 */
	key: string;

	/**
	 * If maps valid schema keys to propety names,
	 * children referenced by the schema key will be removed by its id
	 */
	removeChildren: SchemaMap | null;
}

/**
 * Base interface for `AddData`, and `RemoveData` action payload.
 */
export interface NormalizeActionSchemaConfig {
	/**
	 * Schema definition of the entity. Used for de-/ and normalizing given entities.
	 */
	schema: schema.Entity;
}

/**
 * Base interface for AddChildData` and `RemoveChildData` action payload.
 */
export interface NormalizeChildActionSchemaConfig {
	/**
	 * Schema definition of the entity. Used for de-/ and normalizing given entities.
	 */
	parentSchema: NormalizeActionSchemaConfig['schema'];
}

/**
 * Typed Interface for the config of the `AddData` and `SetData` action.
 * Holds an typed array of entities to be added to the store.
 */
export interface NormalizeActionConfig<T> extends NormalizeActionSchemaConfig {
	/**
	 * The array of entities which should be normalized and added to the store.
	 */
	data: T[];
}

/**
 * Typed Interface for the config of the `AddData` and `SetData` action.
 * Holds an typed array of entities to be added to the store.
 */
export interface NormalizeUpdateActionConfig<T>
	extends NormalizeActionSchemaConfig {
	/**
	 * The id of the entity to update
	 */
	id: NormalizeRemoveActionPayload['id'];

	/**
	 * Data to set in the entity
	 */
	changes: Partial<T>;
}

/**
 * Typed Interface for the config of the `AddChildData` action.
 * Holds an typed array of entities to be added to the store.
 */
export interface NormalizeChildActionConfigBase<T>
	extends NormalizeChildActionSchemaConfig {
	/**
	 * The array of entities which should be normalized and added to the store.
	 */
	data: T[];
}

/**
 * Interface for child data related actions
 */
export interface NormalizeChildActionPayload extends NormalizeActionPayload {
	/**
	 * The id of the parent entity
	 */
	parentId: string;

	/**
	 * Key of the parent's property which holds the child references
	 */
	parentProperty: string;

	/**
	 * Schema key of the parent's property
	 */
	parentSchemaKey: string;
}

/**
 * Interface for the payload of the `RemoveChildAction`
 */
export interface NormalizeRemoveChildActionPayload {
	/**
	 * The id of the entity that should be removed
	 */
	id: NormalizeRemoveActionPayload['id'];

	/**
	 * The key of the child schema
	 */
	childSchemaKey: string;

	/**
	 * The id of the parent entity
	 */
	parentId: NormalizeChildActionPayload['parentId'];

	/**
	 * Key of the parent's property which holds the child references
	 */
	parentProperty: NormalizeChildActionPayload['parentProperty'];

	/**
	 * Schema key of the parent's property
	 */
	parentSchemaKey: NormalizeChildActionPayload['parentSchemaKey'];
}

/**
 * Interface for the payload of the `RemoveData` action.
 * Accepts an `id` and an optional `removeChildren` property.
 */
export interface NormalizeRemoveActionConfig
	extends NormalizeActionSchemaConfig {
	/**
	 * The id of the entity that should be removed
	 */
	id: NormalizeRemoveActionPayload['id'];

	/**
	 * If maps valid schema keys to propety names,
	 * children referenced by the schema key will be removed by its id
	 */
	removeChildren?: NormalizeRemoveActionPayload['removeChildren'];
}

/**
 * Interface for the payload of the `AddChildData` action.
 */
export interface NormalizeChildActionConfig<T>
	extends NormalizeChildActionConfigBase<T> {
	/**
	 * The schema of the child data to add
	 */
	childSchema: schema.Entity;

	/**
	 * The id of the parent entity
	 */
	parentId: NormalizeChildActionPayload['parentId'];
}

/**
 * Interface for the payload of the `RemoveData` action.
 * Accepts an `id` and an optional `removeChildren` property.
 */
export interface NormalizeRemoveChildActionConfig
	extends NormalizeChildActionSchemaConfig {
	/**
	 * The id of the entity that should be removed
	 */
	id: NormalizeRemoveActionPayload['id'];

	/**
	 * The schema of the child data to add
	 */
	childSchema: schema.Entity;

	/**
	 * The id of the parent entity
	 */
	parentId: NormalizeChildActionPayload['parentId'];
}

/**
 * Payload of the `UpdateAction`
 */
export interface NormalizeUpdateActionPayload<T> {
	/**
	 * The id of the entity that should be removed
	 */
	id: NormalizeUpdateActionConfig<T>['id'];

	/**
	 * Schema key of the entity to update
	 */
	key: string;

	/**
	 * The data to set in the entity
	 */
	changes: EntityMap;

	/**
	 * The original sorted id's as an array
	 */
	result: string[];
}

/**
 * Interface for result for the `actionCreators` function
 */
export interface NormalizeActionCreators<T> {
	/**
	 * Action creator for the `SetData` action
	 */
	setData: (data: NormalizeActionConfig<T>['data']) => SetData<T>;

	/**
	 * Action creator for the `AddData` action
	 */
	addData: (data: NormalizeActionConfig<T>['data']) => AddData<T>;

	/**
	 * Action creator for the `AddChildData` action
	 */
	addChildData: <C>(
		data: NormalizeChildActionConfig<C>['data'],
		childSchema: NormalizeChildActionConfig<C>['childSchema'],
		parentId: NormalizeChildActionConfig<C>['parentId']
	) => AddChildData<C>;

	/**
	 * Action creator for the `AddChildData` action
	 */
	updateData: (
		id: NormalizeUpdateActionConfig<T>['id'],
		changes: NormalizeUpdateActionConfig<T>['changes']
	) => UpdateData<T>;

	/**
	 * Action creator for the `removeData` action
	 */
	removeData: (
		id: NormalizeRemoveActionConfig['id'],
		removeChildren?: NormalizeRemoveActionConfig['removeChildren']
	) => RemoveData;

	/**
	 * Action creator for the `AddChildData` action
	 */
	removeChildData: (
		id: NormalizeRemoveChildActionConfig['id'],
		childSchema: NormalizeRemoveChildActionConfig['childSchema'],
		parentId: NormalizeRemoveChildActionConfig['parentId']
	) => RemoveChildData;
}

/**
 * All types of the provided actions.
 */
export class NormalizeActionTypes {
	/**
	 * Action type of the `SetData` action.
	 */
	static readonly SET_DATA = `${ACTION_NAMESPACE} Set Data`;

	/**
	 * Action type of the `AddData` action.
	 */
	static readonly ADD_DATA = `${ACTION_NAMESPACE} Add Data`;

	/**
	 * Action type of the `AddChildData` action.
	 */
	static readonly ADD_CHILD_DATA = `${ACTION_NAMESPACE} Add Child Data`;

	/**
	 * Action type of the `UpdateData` action
	 */
	static readonly UPDATE_DATA = `${ACTION_NAMESPACE} Update Data`;

	/**
	 * Action type of the `RemoveData` action.
	 */
	static readonly REMOVE_DATA = `${ACTION_NAMESPACE} Remove Data`;

	/**
	 * Action type of the `RemoveChildData` action.
	 */
	static readonly REMOVE_CHILD_DATA = `${ACTION_NAMESPACE} Remove Child Data`;
}

/**
 * Action for settings denormalized entities in the store.
 * Also see `NormalizeDataPayload`.
 */
export class SetData<T> implements Action {
	/**
	 * The action type: `NormalizeActionTypes.SET_DATA`
	 */
	readonly type = NormalizeActionTypes.SET_DATA;

	/**
	 * The payload will be an object of the normalized entity map as `entities`
	 * and the original sorted id's as an array in the `result` property.
	 */
	public payload: NormalizeActionPayload;

	/**
	 * SetData Constructor
	 * @param config The action config object
	 */
	constructor(config: NormalizeActionConfig<T>) {
		this.payload = normalize(config.data, [config.schema]);
	}
}

/**
 * Action for adding/updating data to the store.
 * Also see `NormalizeDataPayload`.
 */
export class AddData<T> implements Action {
	/**
	 * The action type: `NormalizeActionTypes.ADD_DATA`
	 */
	readonly type = NormalizeActionTypes.ADD_DATA;

	/**
	 * The payload will be an object of the normalized entity map as `entities`
	 * and the original sorted id's as an array in the `result` property.
	 */
	public payload: NormalizeActionPayload;

	/**
	 * AddData Constructor
	 * @param config The action config object
	 */
	constructor(config: NormalizeActionConfig<T>) {
		this.payload = normalize(config.data, [config.schema]);
	}
}

/**
 * Action for adding/updating data to the store.
 * Also see `NormalizeDataPayload`.
 */
export class AddChildData<T> implements Action {
	/**
	 * The action type: `NormalizeActionTypes.ADD_CHILD_DATA`
	 */
	readonly type = NormalizeActionTypes.ADD_CHILD_DATA;

	/**
	 * The payload will be an object of the normalized entity map as `entities`
	 * and the original sorted id's as an array in the `result` property.
	 */
	public payload: NormalizeChildActionPayload;

	/**
	 * AddData Constructor
	 * @param config The action config object
	 */
	constructor(config: NormalizeChildActionConfig<T>) {
		const { data, parentSchema, parentId, childSchema } = config;
		this.payload = {
			...(normalize(data, [childSchema]) as NormalizeActionPayload),
			parentSchemaKey: parentSchema.key,
			parentProperty: getRelationProperty(parentSchema, childSchema),
			parentId
		};
	}
}

/**
 * Action for adding/updating data to the store.
 * Also see `NormalizeDataPayload`.
 */
export class UpdateData<T> implements Action {
	/**
	 * The action type: `NormalizeActionTypes.UPDATE_DATA`
	 */
	readonly type = NormalizeActionTypes.UPDATE_DATA;

	/**
	 * The payload will be an object of the normalized entity map as `entities`
	 * and the original sorted id's as an array in the `result` property.
	 */
	public payload: NormalizeUpdateActionPayload<T>;

	/**
	 * AddData Constructor
	 * @param config The action config object
	 */
	constructor(config: NormalizeUpdateActionConfig<T>) {
		const { id, schema, changes } = config;
		(changes as any)[(schema as any)._idAttribute] = id;
		const normalized = normalize([config.changes], [config.schema]);

		this.payload = {
			id,
			key: schema.key,
			changes: normalized.entities,
			result: normalized.result
		};
	}
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
	 * The payload will be an object of the normalized entity map as `entities`
	 * and the original sorted id's as an array in the `result` property.
	 */
	public payload: NormalizeRemoveActionPayload;

	/**
	 * RemoveData Constructor
	 * @param payload The action payload used in the reducer
	 */
	constructor(config: NormalizeRemoveActionConfig) {
		let { id, removeChildren, schema } = config;
		let removeMap: SchemaMap = null;

		// cleanup removeChildren object by setting only existing
		// properties to removeMap
		if (removeChildren && (schema as any).schema) {
			removeMap = Object.entries(removeChildren).reduce(
				(p: any, [key, entityProperty]: [string, string]) => {
					if (entityProperty in (schema as any).schema) {
						p[key] = entityProperty;
					}
					return p;
				},
				{}
			);
		}

		this.payload = {
			id,
			key: schema.key,
			removeChildren:
				removeMap && Object.keys(removeMap).length ? removeMap : null
		};
	}
}

/**
 * Action for removing data from the store.
 * Also see `NormalizeRemovePayload`.
 */
export class RemoveChildData implements Action {
	/**
	 * The action type: `NormalizeActionTypes.REMOVE_CHILD_DATA`
	 */
	readonly type = NormalizeActionTypes.REMOVE_CHILD_DATA;

	/**
	 * The payload will be an object of the normalized entity map as `entities`
	 * and the original sorted id's as an array in the `result` property.
	 */
	public payload: NormalizeRemoveChildActionPayload;

	/**
	 * RemoveData Constructor
	 * @param payload The action payload used in the reducer
	 */
	constructor(config: NormalizeRemoveChildActionConfig) {
		let { id, parentSchema, childSchema, parentId } = config;
		this.payload = {
			id,
			childSchemaKey: childSchema.key,
			parentProperty: getRelationProperty(parentSchema, childSchema),
			parentSchemaKey: parentSchema.key,
			parentId
		};
	}
}

/**
 * Create a add of action creators for the `AddData` and `RemoveData` actions.
 * This is provided for convenience.
 * @param schema The schema the action creators should be bound to
 */
export function actionCreators<T>(
	schema: schema.Entity
): NormalizeActionCreators<T> {
	return {
		/**
		 * Action creator for the `SetData` action.
		 * @returns A new instance of the `SetData` action with the given schema.
		 */
		setData: (data: NormalizeActionConfig<T>['data']) =>
			new SetData<T>({ data, schema }),

		/**
		 * Action creator for the `AddData` action.
		 * @returns A new instance of the `AddData` action with the given schema.
		 */
		addData: (data: NormalizeActionConfig<T>['data']) =>
			new AddData<T>({ data, schema }),

		/**
		 * Action creator for the `AddChildData` action.
		 * @returns A new instance of the `AddChildData` action with the given schema.
		 */
		addChildData: <C>(
			data: NormalizeChildActionConfig<C>['data'],
			childSchema: NormalizeChildActionConfig<C>['childSchema'],
			parentId: NormalizeChildActionConfig<C>['parentId']
		) =>
			new AddChildData<C>({
				data,
				parentSchema: schema,
				childSchema,
				parentId
			}),

		/**
		 * Action creator for the `UpdateData` action.
		 * @returns A new instance of the `UpdateData` action with the given schema.
		 */
		updateData: (
			id: NormalizeUpdateActionConfig<T>['id'],
			changes: NormalizeUpdateActionConfig<T>['changes']
		) => new UpdateData({ id, schema, changes }),

		/**
		 * Action creator for the `RemoveData` action.
		 * @returns A new instance of the `RemoveData` action with the given schema.
		 */
		removeData: (
			id: NormalizeRemoveActionConfig['id'],
			removeChildren?: NormalizeRemoveActionConfig['removeChildren']
		) => new RemoveData({ id, schema, removeChildren }),

		/**
		 * Action creator for the `RemoveChildData` action.
		 * @returns A new instance of the `RemoveChildData` action with the given schema.
		 */
		removeChildData: (
			id: NormalizeRemoveChildActionConfig['id'],
			childSchema: NormalizeRemoveChildActionConfig['childSchema'],
			parentId: NormalizeRemoveChildActionConfig['parentId']
		) =>
			new RemoveChildData({ id, parentSchema: schema, childSchema, parentId })
	};
}

/**
 * Return the parents property name the child schema is related to
 * @param schema The parent schema
 * @param childSchema The child schema
 */
function getRelationProperty(
	schema: schema.Entity,
	childSchema: schema.Entity
): string {
	let parentProperty = null;
	const relations: {
		[key: string]: schema.Entity | [schema.Entity];
	} = (schema as any).schema;

	/* istanbul ignore else */
	if (relations) {
		Object.keys(relations).some(k => {
			let key = Array.isArray(relations[k])
				? (relations[k] as [schema.Entity])[0].key
				: (relations[k] as schema.Entity).key;

			/* istanbul ignore else */
			if (key === childSchema.key) {
				parentProperty = k;
				return true;
			}
		});
	}
	return parentProperty;
}
