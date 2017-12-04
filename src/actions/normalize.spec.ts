import 'should';
import { Action } from '@ngrx/store';
import { schema as normalizrSchema, normalize, schema } from 'normalizr';
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
	const childData = [
		{ id: '5', property: 'new-child-value' },
		{ id: '6', property: 'new-child-value' }
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

	describe('AddChildData', () => {
		it('should be exported', () => {
			actions.AddChildData.should.be.a.Function();
		});

		it('should be serializable', () => {
			const parentId = data[0].id;
			checkSerialization(
				new actions.AddChildData({
					data: childData,
					parentSchema: schema,
					parentId,
					childSchema
				})
			);
		});
	});

	describe('UpdateData', () => {
		it('should be exported', () => {
			actions.UpdateData.should.be.a.Function();
		});

		it('should be serializable', () => {
			checkSerialization(
				new actions.UpdateData({ id: data[0].id, changes: data, schema })
			);
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

	describe('RemoveChildData', () => {
		it('should be exported', () => {
			actions.RemoveChildData.should.be.a.Function();
		});

		it('should be serializable', () => {
			const parentId = data[0].id;
			checkSerialization(
				new actions.RemoveChildData({
					id: data[0].id,
					parentSchema: schema,
					parentId,
					childSchema
				})
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

		describe('AddChildData creator', () => {
			const action = result.addChildData(childData, childSchema, data[0].id);

			it('should create an AddChildData action', () => {
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('entities', 'result');
				action.payload.entities.should.eql(
					normalize(childData, [childSchema]).entities
				);
				action.payload.parentSchemaKey.should.eql('parent');
				action.payload.parentProperty.should.eql('childs');
				action.payload.parentId.should.eql(data[0].id);
			});
		});

		describe('UpdateData creator', () => {
			const updateData = { newProperty: 'newValue', childs: childData };
			const action = result.updateData(data[0].id, updateData);

			it('should create an UpdateData action', () => {
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('key', 'id', 'changes', 'result');

				const expectedParent = {
					id: data[0].id,
					newProperty: updateData.newProperty,
					childs: [...updateData.childs.map(c => c.id)]
				};

				action.payload.changes[schema.key][data[0].id].should.eql(
					expectedParent
				);
				action.payload.changes[childSchema.key][childData[0].id].should.eql(
					childData[0]
				);
				action.payload.changes[childSchema.key][childData[1].id].should.eql(
					childData[1]
				);
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

		describe('RemoveChildData creator', () => {
			const action = result.removeChildData(
				childData[0].id,
				childSchema,
				data[0].id
			);

			it('should create an RemoveChildData action', () => {
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties(
					'parentProperty',
					'parentSchemaKey',
					'parentId',
					'id'
				);
				action.payload.id.should.eql(childData[0].id);
				action.payload.parentSchemaKey.should.eql('parent');
				action.payload.parentProperty.should.eql('childs');
				action.payload.parentId.should.eql(data[0].id);
			});
		});
	});
});
