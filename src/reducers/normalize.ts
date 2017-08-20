import { createSelector, MemoizedSelector } from '@ngrx/store';
import { normalize, denormalize, schema } from 'normalizr';

import { NormalizeActionTypes } from '../actions/normalize';

/**
 * The state key under which the normalized state will be stored
 */
export const STATE_KEY = '@@normalized';

/**
 * A map of scheka keys to a map of entity id's to entity data
 */
export interface EntityMap {
	[key: string]: { [id: string]: any };
}

/**
 * The state interface from which the app state should extend
 */
export interface NormalizedState {
	/** The normalized state property */
	'@@normalized': NormalizedEntityState;
}

/**
 * The normalized state, representing a normalizr result
 */
export interface NormalizedEntityState {
	/** The original sorting of the unnormalized data */
	result: string[];
	/** The normalized result */
	entities: EntityMap;
}

/**
 * An initial state for the normalized state
 */
const initialState: NormalizedEntityState = {
	result: [],
	entities: {}
};

/**
 * The normalizing reducer function which will listen to `NormalizeActionTypes.SET_DATA`
 * and `NormalizeActionTypes.REMOVE_DATA`.
 *
 * `action.payload` can hold different schemed entities which could have been updated/added
 *
 * @param state The current state
 * @param action The dispatched action
 */
export function reducer(
	state: NormalizedEntityState = initialState,
	action: any
) {
	switch (action.type) {
		case NormalizeActionTypes.SET_DATA: {
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
					if (child && schema.schema[key] && entities[key]) {
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

const getNormalizedState = (state: any): NormalizedEntityState =>
	state[STATE_KEY];

export const getNormalizedEntities: MemoizedSelector<
	any,
	EntityMap
> = createSelector(
	getNormalizedState,
	(state: NormalizedEntityState) => state.entities
);

export const getResult: MemoizedSelector<any, string[]> = createSelector(
	getNormalizedState,
	(state: NormalizedEntityState) => state.result
);

export function createSchemaSelectors<T>(schema: schema.Entity) {
	return {
		getNormalizedEntities,
		getEntities: createEntitiesSelector<T>(schema),
		entityProjector: createEntityProjector<T>(schema),
		entitiesProjector: createEntitiesProjector<T>(schema)
	};
}

function createEntitiesSelector<T>(
	schema: schema.Entity
): MemoizedSelector<{}, T[]> {
	return createSelector(
		getNormalizedEntities,
		createEntitiesProjector<T>(schema)
	);
}

function createEntityProjector<T>(schema: schema.Entity) {
	return (entities: {}, id: string) =>
		createDenormalizer(schema)(entities, id) as T;
}

function createEntitiesProjector<T>(schema: schema.Entity) {
	return (entities: {}) => createDenormalizer(schema)(entities) as T[];
}

function createDenormalizer(schema: schema.Entity) {
	const key = schema.key;
	return (entities: { [key: string]: {} }, id?: string) => {
		if (!entities || !entities[key]) {
			return;
		}
		const data = id ? { [key]: [id] } : { [key]: Object.keys(entities[key]) };
		const denormalized = denormalize(data, { [key]: [schema] }, entities);
		return id ? denormalized[key][0] : denormalized[key];
	};
}
