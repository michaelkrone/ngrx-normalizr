import 'should';
import { Action } from '@ngrx/store';
import { schema as normalizrSchema, normalize } from 'normalizr';
import * as actions from './normalize';

describe('Normalize actions', () => {
	const childSchema = new normalizrSchema.Entity('child');
	const schema = new normalizrSchema.Entity('parent', {
		childs: [childSchema]
	});
	const removeChildren = { child: 'childs' };
	const data = [
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

	function checkSerialization(action: Action) {
		const deserialized = JSON.parse(JSON.stringify(action));
		deserialized.should.have.properties(Object.keys(action));
		Object.keys(action).forEach(k => {
			action[k].should.eql(deserialized[k]);
		});
	}

	describe('SetData', () => {
		it('should be exported', () => {
			actions.SetData.should.be.a.Function();
		});

		it('should be serializable', () => {
			checkSerialization(new actions.SetData({ data, schema }));
		});
	});

	describe('AddData', () => {
		it('should be exported', () => {
			actions.AddData.should.be.a.Function();
		});

		it('should be serializable', () => {
			checkSerialization(new actions.AddData({ data, schema }));
		});
	});

	describe('RemoveData', () => {
		it('should be exported', () => {
			actions.RemoveData.should.be.a.Function();
		});

		it('should be serializable', () => {
			checkSerialization(
				new actions.RemoveData({ id: '1', schema, removeChildren: {} })
			);
		});
	});

	describe('creator', () => {
		const result = actions.actionCreators(schema);

		it('should be exported', () => {
			actions.actionCreators.should.be.a.Function();
		});

		it('should return action creator functions', () => {
			result.should.be.an
				.Object()
				.and.have.properties('setData', 'removeData', 'addData');
			result.setData.should.be.a.Function();
			result.removeData.should.be.a.Function();
			result.addData.should.be.a.Function();
		});

		describe('SetData creator', () => {
			const action = result.setData(data);

			it('should create a SetData action', () => {
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('entities', 'result');
				action.payload.entities.should.eql(normalize(data, [schema]).entities);
			});
		});

		describe('AddData creator', () => {
			const action = result.addData(data);

			it('should create an AddData action', () => {
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('entities', 'result');
				action.payload.entities.should.eql(normalize(data, [schema]).entities);
			});
		});

		describe('RemoveData creator', () => {
			const id = 'some';
			const result = actions.actionCreators(schema);

			it('should create a RemoveData action', () => {
				const action = result.removeData(id);
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('id');
				action.payload.id.should.eql(id);
			});

			it('should create a RemoveData action with removeChildren option', () => {
				const action = result.removeData(id, removeChildren);
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('id', 'removeChildren');
				action.payload.id.should.eql(id);
				action.payload.removeChildren.should.eql(removeChildren);
			});

			it('should not add invalid entity keys to the removeChildren payload', () => {
				const action = result.removeData(id, { some: 'random' });
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('id', 'removeChildren');
				action.payload.id.should.eql(id);
				(action.payload.removeChildren === null).should.be.true();
			});
		});
	});
});
