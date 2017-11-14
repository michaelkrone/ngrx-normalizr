import { schema } from 'normalizr';
import * as should from 'should';

import * as actions from '../actions/normalize';
import * as reducer from './normalize';

const childSchema = new schema.Entity('child');
const mySchema = new schema.Entity('parent', { childs: [childSchema] });

interface Child {
	id: string;
	property: string;
}

interface Parent {
	id: string;
	property: string;
	childs: [Child];
}

describe('reducers', () => {
	let data: Parent[];
	let childData: Child[];

	beforeEach(() => {
		data = [
			{
				id: '1',
				property: 'value',
				childs: [
					{ id: '1', property: 'child-value' },
					{ id: '2', property: 'child-value' }
				]
			},
			{
				id: '2',
				property: 'value',
				childs: [
					{ id: '3', property: 'child-value' },
					{ id: '4', property: 'child-value' }
				]
			}
		];

		childData = [
			{ id: '5', property: 'new-child-value' },
			{ id: '6', property: 'new-child-value' }
		];
	});

	describe('reducer function', () => {
		it('should be exported', () => {
			reducer.normalized.should.be.a.Function();
			reducer.normalized.length.should.eql(2);
		});

		it('should return the default state', () => {
			const state = reducer.normalized(undefined, { type: 'some' });
			state.should.have.properties('entities', 'result');
			state.entities.should.be.an.Object();
			state.entities.should.eql({});
			state.result.should.eql([]);
		});

		describe('handling action', () => {
			let addAction1,
				addAction2,
				setAction1,
				addChildAction1,
				removeChildAction1;

			beforeEach(() => {
				addAction1 = new actions.AddData<Parent>({
					data: [data[0]],
					schema: mySchema
				});
				addAction2 = new actions.AddData<Parent>({
					data: [data[1]],
					schema: mySchema
				});
				setAction1 = new actions.SetData<Parent>({
					data: [data[1]],
					schema: mySchema
				});
				addChildAction1 = new actions.AddChildData<Child>({
					data: childData,
					schema: mySchema,
					childSchema,
					parentId: data[0].id
				});
				removeChildAction1 = new actions.RemoveChildData({
					id: data[0].childs[0].id,
					childSchema,
					schema: mySchema,
					parentId: data[0].id
				});
			});

			describe('SetData', () => {
				it('should set data in the store', () => {
					const state = reducer.normalized(undefined, setAction1);
					state.entities.should.have.properties('parent', 'child');
					Object.keys(state.entities.parent).should.eql([data[1].id]);
					Object.keys(state.entities.child).should.eql(
						data[1].childs.map(c => c.id)
					);
					state.result.should.eql([data[1].id]);
				});

				it('should overwrite data in the store', () => {
					let state = reducer.normalized(undefined, addAction1);
					state = reducer.normalized(state, setAction1);
					state.entities.should.have.properties('parent', 'child');
					Object.keys(state.entities.parent).should.eql([data[1].id]);
					Object.keys(state.entities.child).should.eql(
						data[1].childs.map(c => c.id)
					);
					state.result.should.eql([data[1].id]);
				});
			});

			describe('AddData', () => {
				it('should add data to the store', () => {
					const state = reducer.normalized(undefined, addAction1);
					state.entities.should.have.properties('parent', 'child');
					Object.keys(state.entities.parent).should.eql([data[0].id]);
					Object.keys(state.entities.child).should.eql(
						data[0].childs.map(c => c.id)
					);
					state.result.should.eql([data[0].id]);
				});

				it('should update data in the store', () => {
					let state = reducer.normalized(undefined, addAction1);
					state = reducer.normalized(state, addAction2);
					state.entities.should.have.properties('parent', 'child');
					state.entities.parent.should.have.properties(data.map(d => d.id));
					state.result.should.eql([data[1].id]);
				});
			});

			describe('AddChildData', () => {
				it('should add child data to the store', () => {
					let state = reducer.normalized(undefined, addAction1);
					state = reducer.normalized(state, addChildAction1);
					state.entities.should.have.properties('parent', 'child');
					Object.keys(state.entities.parent).should.eql([data[0].id]);
					Object.keys(state.entities.child).should.containDeep(
						[...childData, ...data[0].childs].map(c => c.id)
					);
					state.result.should.eql(childData.map(c => c.id));
				});

				it('should update data in the store', () => {
					let state = reducer.normalized(undefined, addAction1);
					state = reducer.normalized(state, addAction2);
					state.entities.should.have.properties('parent', 'child');
					state.entities.parent.should.have.properties(data.map(d => d.id));
					state.result.should.eql([data[1].id]);
				});
			});

			describe('RemoveData', () => {
				it('should remove data from the store', () => {
					let state = reducer.normalized(undefined, addAction1);
					state = reducer.normalized(
						state,
						new actions.RemoveData({ id: data[0].id, schema: mySchema })
					);
					should(state.entities.parent[data[0].id]).be.undefined();
					data[0].childs
						.map(c => c.id)
						.forEach(id => should.exist(state.entities.child[id]));
				});

				it('should not remove any data if an invalid id is passed', () => {
					let state = reducer.normalized(undefined, addAction1);
					state = reducer.normalized(
						state,
						new actions.RemoveData({ id: 'ZOMG', schema: mySchema })
					);
					state.entities.parent.should.have.properties(data[0].id);
				});

				it('should remove data and its childs', () => {
					let state = reducer.normalized(undefined, addAction1);
					state = reducer.normalized(
						state,
						new actions.RemoveData({
							id: data[0].id,
							schema: mySchema,
							removeChildren: { child: 'childs' }
						})
					);
					should(state.entities.parent[data[0].id]).be.undefined();
					data[0].childs
						.map(c => c.id)
						.forEach(id => should.not.exist(state.entities.child[id]));
				});

				it('should remove child data if its not an array', () => {
					const childSchema2 = new schema.Entity('child');
					const mySchema2 = new schema.Entity('parent', {
						child: childSchema
					});
					const denormalizedData = [
						{
							id: '1',
							child: { id: '2' }
						}
					];
					const action = new actions.SetData({
						data: denormalizedData,
						schema: mySchema2
					});
					let state = reducer.normalized(undefined, action);
					state = reducer.normalized(
						state,
						new actions.RemoveData({
							id: denormalizedData[0].id,
							schema: mySchema2,
							removeChildren: { child: 'child' }
						})
					);
					should(state.entities.parent[denormalizedData[0].id]).be.undefined();
					should(
						state.entities.child[denormalizedData[0].child.id]
					).be.undefined();
				});
			});

			describe('RemoveChildData', () => {
				it('should remove child data from the store', () => {
					let state = reducer.normalized(undefined, addAction1);
					state = reducer.normalized(state, removeChildAction1);
					should(state.entities.parent[data[0].id]).be.ok();
					should(state.entities.child[data[0].childs[0].id]).not.be.ok();
					state.entities.parent[data[0].id].childs.should.not.containDeep(
						data[0].childs[0].id
					);
				});
			});
		});
	});

	describe('exported selectors', () => {
		let add;

		beforeEach(() => {
			add = new actions.AddData({ data: [data[0]], schema: mySchema });
		});

		describe('getResult', () => {
			it('should be exported', () => {
				should(reducer.getResult).not.be.undefined();
				reducer.getResult.should.be.a.Function();
			});

			it('should return the result', () => {
				const add = new actions.AddData({ data: [data[0]], schema: mySchema });
				const state = reducer.normalized(undefined, add);
				const result = reducer.getResult({ normalized: state });
				result.should.eql(state.result);
			});
		});

		describe('getNormalizedEntities', () => {
			it('should be exported', () => {
				should(reducer.getNormalizedEntities).not.be.undefined();
				reducer.getNormalizedEntities.should.be.a.Function();
			});

			it('should return the normalized entity state', () => {
				const normalized = reducer.normalized(undefined, add);
				const denormalized = reducer.getNormalizedEntities({ normalized });
				denormalized.should.be.an.Object();
				denormalized.should.have.properties('parent', 'child');
			});
		});
	});

	describe('create schema selectors', () => {
		let add, addAll, selectors;

		beforeEach(() => {
			selectors = reducer.createSchemaSelectors(mySchema);
			add = new actions.AddData({ data: [data[0]], schema: mySchema });
			addAll = new actions.AddData({ data, schema: mySchema });
		});

		it('should exist as a function', () => {
			reducer.createSchemaSelectors.should.be.a.Function();
			reducer.createSchemaSelectors.should.have.lengthOf(1);
		});

		describe('schema selectors', () => {
			it('should return schema selectors', () => {
				selectors.should.have.properties(
					'getNormalizedEntities',
					'getEntities'
				);
				selectors.getNormalizedEntities.should.be.a.Function();
				selectors.getEntities.should.be.a.Function();
			});

			describe('getEntities', () => {
				it('should return the denormalized entities', () => {
					const normalized = reducer.normalized(undefined, add);
					const denormalized = selectors.getEntities({ normalized });
					denormalized.should.be.an.Array();
					denormalized[0].should.eql(data[0]);
				});
			});
		});

		describe('projector functions', () => {
			let projectors;

			beforeEach(() => {
				projectors = reducer.createSchemaSelectors(mySchema);
			});

			it('should return schema projectors', () => {
				projectors.should.have.properties(
					'entityProjector',
					'entitiesProjector'
				);
				projectors.entityProjector.should.be.a.Function();
				projectors.entitiesProjector.should.be.a.Function();
			});

			describe('entitiesProjector', () => {
				it('should take entities and optionally ids as arguments', () => {
					projectors.entitiesProjector.should.have.lengthOf(2);
				});

				it('should project the given schema to denormalized entities', () => {
					const normalized = reducer.normalized(undefined, addAll);
					const denormalized = projectors.entitiesProjector(
						normalized.entities
					);
					denormalized.should.eql(data);
				});
			});

			describe('entityProjector', () => {
				it('should take entities and an id as an argument', () => {
					projectors.entityProjector.should.have.lengthOf(2);
				});

				it('should project the given schema to one denormalized entitiy', () => {
					const normalized = reducer.normalized(undefined, addAll);
					const denormalized = projectors.entityProjector(
						normalized.entities,
						data[1].id
					);
					denormalized.should.eql(data[1]);
				});
			});
		});
	});
});
