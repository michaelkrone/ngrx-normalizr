import { schema } from 'normalizr';
import * as should from 'should';

import * as actions from '../actions/normalize';
import * as reducer from './normalize';

const myChildSchema = new schema.Entity('child');
const mySchema = new schema.Entity('parent', { childs: [myChildSchema] });

describe('reducers', () => {
	let data, addAction1, addAction2, setAction1;

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
		addAction1 = new actions.AddData({ data: [data[0]], schema: mySchema });
		addAction2 = new actions.AddData({ data: [data[1]], schema: mySchema });
		setAction1 = new actions.SetData({ data: [data[1]], schema: mySchema });
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
	});

	describe('SetData action', () => {
		it('should set data in the store', () => {
			const state = reducer.normalized(undefined, setAction1);
			state.entities.should.have.properties('parent', 'child');
			state.entities.parent.should.have.properties(data[1].id);
			state.result.should.eql([data[1].id]);
		});

		it('should overwrite data in the store', () => {
			let state = reducer.normalized(undefined, addAction1);
			state = reducer.normalized(state, setAction1);
			state.entities.should.have.properties('parent', 'child');
			Object.keys(state.entities.parent).should.eql([data[1].id]);
			state.result.should.eql([data[1].id]);
		});
	});

	describe('AddData action', () => {
		it('should add data to the store', () => {
			const state = reducer.normalized(undefined, addAction1);
			state.entities.should.have.properties('parent', 'child');
			state.entities.parent.should.have.properties(data[0].id);
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

	describe('RemoveData action', () => {
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
	});

	describe('create schema selectors', () => {
		it('should exist as a function', () => {
			reducer.createSchemaSelectors.should.be.a.Function();
			reducer.createSchemaSelectors.should.have.lengthOf(1);
		});

		it('should return schema selectors', () => {
			const selectrs = reducer.createSchemaSelectors(mySchema);
			selectrs.should.have.properties('getNormalizedEntities', 'getEntities');
			selectrs.getNormalizedEntities.should.be.a.Function();
			selectrs.getEntities.should.be.a.Function();
		});

		it('should return schema projectors', () => {
			const prjktrs = reducer.createSchemaSelectors(mySchema);
			prjktrs.should.have.properties('entityProjector', 'entitiesProjector');
			prjktrs.entityProjector.should.be.a.Function();
			prjktrs.entitiesProjector.should.be.a.Function();
		});
	});
});
