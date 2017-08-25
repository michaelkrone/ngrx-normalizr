/**
 * Exports reducers and selectors of the ngrx-normalizr package.
 */

import { createSelector, MemoizedSelector } from '@ngrx/store';
import { normalize, denormalize, schema } from 'normalizr';

import { NormalizeActionTypes } from '../actions/normalize';

/**
 * The state key under which the normalized state will be stored
 */
const STATE_KEY = 'normalized';

/**
 * Interface describing the entities propery of a normalized state.
 * A map of schema keys wich map to a map of entity id's to entity data.
 * This corresponds to the `entities` property of a `normalizr.normalize` result.
 */
export interface EntityMap {
	[key: string]: { [id: string]: any };
}

/**
 * The state interface from which the app state should extend.
 * Holds an instance of `NormalizedEntityState` itself.
 */
export interface NormalizedState {
	/** The normalized state property */
	normalized: NormalizedEntityState;
}

/**
 * The normalized state, representing a `normalizr.normalize` result.
 * Can be selected by the provided `getNormalizedEntities` and `getResult`
 * selectors.
 */
export interface NormalizedEntityState {
	/**
   * The original sorting of the unnormalized data.
   * Holds all id's of the last set operation in original order.
   * Can be used to restore the original sorting of entities
   */
	result: string[];

	/**
   * The normalized entities. Should be passed to all projector functions
   * to enable access to all entities needed.
   */
	entities: EntityMap;
}

/**
 * The initial state for the normalized entity state.
 */
const initialState: NormalizedEntityState = {
	result: [],
	entities: {}
};

/**
 * The normalizing reducer function which will handle actions with the types
 * `NormalizeActionTypes.SET_DATA`, `NormalizeActionTypes.ADD_DATA` and `NormalizeActionTypes.REMOVE_DATA`.
 *
 * On an `NormalizeActionTypes.SET_DATA` action:
 *
 * All entities and childs of the given schema will be replaced with the new entities.
 *
 * On an `NormalizeActionTypes.ADD_DATA` action:
 *
 * Entities are identified by their id attribute set in the schema passed by the payload.
 * Existing entities will be overwritten by updated data, new entities will be added to the store.
 *
 * On an `NormalizeActionTypes.REMOVE_DATA` action:
 *
 * Entities are identified by their id attribute set in the schema passed by the payload.
 * The entity with the passed id will be removed. If a `removeChildren` option is set in the action
 * payload, it is assumed as a map of schema keys to object property names. All referenced children
 * of the entity will be read by the object propety name and removed by the schema key.
 *
 * @param state The current state
 * @param action The dispatched action, one of `NormalizeActionTypes.ADD_DATA` or `NormalizeActionTypes.REMOVE_DATA`.
 */
export function normalized(
	state: NormalizedEntityState = initialState,
	action: any
) {
	switch (action.type) {
		case NormalizeActionTypes.SET_DATA: {
			const { data, schema } = action.payload;
			const { result, entities } = normalize(data, [schema]);

			return {
				result,
				entities: {
					...state.entities,
					...entities
				}
			};
		}

		case NormalizeActionTypes.ADD_DATA: {
			const { data, schema } = action.payload;
			const { result, entities } = normalize(data, [schema]);

			return {
				result,
				entities: Object.keys(entities).reduce(
					(p: any, c: string) => {
						p[c] = { ...p[c], ...entities[c] };
						return p;
					},
					{ ...state.entities }
				)
			};
		}

		case NormalizeActionTypes.REMOVE_DATA: {
			const { id, schema, removeChildren } = action.payload;
			const entities = { ...state.entities };
			const entity = entities[schema.key][id];

			if (!entity) {
				return state;
			}

			if (removeChildren && schema.schema) {
				Object.entries(
					removeChildren
				).map(([key, entityProperty]: [string, string]) => {
					const child = entity[entityProperty];
					if (child && schema.schema[entityProperty] && entities[key]) {
						const ids = Array.isArray(child) ? child : [child];
						ids.forEach((oldId: string) => delete entities[key][oldId]);
					}
				});
			}

			delete entities[schema.key][id];

			return {
				result: state.result,
				entities
			};
		}

		default:
			return state;
	}
}

/**
 * Default getter for the normalized state
 * @param state any state
 */
const getNormalizedState = (state: any): NormalizedEntityState =>
	state[STATE_KEY];

/**
 * Selects all normalized entities of the state, regardless of their schema.
 * This selector should be used to enable denormalizing projector functions access
 * to all needed schema entities.
 */
export const getNormalizedEntities: MemoizedSelector<
	any,
	EntityMap
> = createSelector(
	getNormalizedState,
	(state: NormalizedEntityState) => state.entities
);

/**
 * Select the result order of the last set operation.
 */
export const getResult: MemoizedSelector<any, string[]> = createSelector(
	getNormalizedState,
	(state: NormalizedEntityState) => state.result
);

/**
 * Creates an object of selectors and projector functions bound to the given schema.
 * @param schema The schema to bind the selectors and projectors to
 */
export function createSchemaSelectors<T>(schema: schema.Entity) {
	return {
		/**
     * Select all entities, regardless of their schema, exported for convenience.
     */
		getNormalizedEntities,

		/**
     * Select all entities and perform a denormalization based on the given schema.
     */
		getEntities: createEntitiesSelector<T>(schema),

		/**
     * Uses the given schema to denormalize an entity by the given id
     */
		entityProjector: createEntityProjector<T>(schema),

		/**
     * Uses the given schema to denormalize all given entities
     */
		entitiesProjector: createEntitiesProjector<T>(schema)
	};
}

/**
 * Create a schema bound selector which denormalizes all entities with the given schema.
 * @param schema The schema to bind this selector to
 */
function createEntitiesSelector<T>(
	schema: schema.Entity
): MemoizedSelector<{}, T[]> {
	return createSelector(
		getNormalizedEntities,
		createEntitiesProjector<T>(schema)
	);
}

/**
 * Create a schema bound projector function to denormalize a single entity.
 * @param schema The schema to bind this selector to
 */
function createEntityProjector<T>(schema: schema.Entity) {
	return (entities: {}, id: string) =>
		createDenormalizer(schema)(entities, id) as T;
}

/**
 * Create a schema bound projector function to denormalize an object of normalized entities
 * @param schema The schema to bind this selector to
 */
function createEntitiesProjector<T>(schema: schema.Entity) {
	return (entities: {}) => createDenormalizer(schema)(entities) as T[];
}

/**
 * Create a schema bound denormalizer.
 * @param schema The schema to bind this selector to
 */
function createDenormalizer(schema: schema.Entity) {
	const key = schema.key;
	return (entities: { [key: string]: {} }, id?: string) => {
		if (!entities || !entities[key]) {
			/* istanbul ignore next */
			return;
		}
		const data = id ? { [key]: [id] } : { [key]: Object.keys(entities[key]) };
		const denormalized = denormalize(data, { [key]: [schema] }, entities);
		return id ? denormalized[key][0] : denormalized[key];
	};
}
