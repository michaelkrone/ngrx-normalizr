import 'should';
import { schema } from 'normalizr';
import * as actions from './normalize';

const mySchema = new schema.Entity('name');

describe('Normalize action', () => {
	describe('SetData', () => {
		it('should be exported', () => {
			actions.SetData.should.be.a.Function();
		});
	});

	describe('AddData', () => {
		it('should be exported', () => {
			actions.AddData.should.be.a.Function();
		});
	});

	describe('RemoveData', () => {
		it('should be exported', () => {
			actions.RemoveData.should.be.a.Function();
		});
	});

	describe('creator', () => {
		const data = [{ some: 'data' }];
		const result = actions.actionCreators(mySchema);

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
				action.payload.should.have.properties('data', 'schema');
				action.payload.data.should.eql(data);
				action.payload.schema.should.eql(mySchema);
			});
		});

		describe('AddData creator', () => {
			const action = result.addData(data);

			it('should create an AddData action', () => {
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('data', 'schema');
				action.payload.data.should.eql(data);
				action.payload.schema.should.eql(mySchema);
			});
		});

		describe('RemoveData creator', () => {
			const id = 'some';
			const removeChildren = { key: 'property' };
			const result = actions.actionCreators(mySchema);

			it('should create a RemoveData action', () => {
				const action = result.removeData(id);
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('id', 'schema');
				action.payload.id.should.eql(id);
				action.payload.schema.should.eql(mySchema);
			});

			it('should create a RemoveData action with removeChildren option', () => {
				const action = result.removeData(id, removeChildren);
				action.should.be.an.Object();
				action.should.have.properties('payload');
				action.payload.should.have.properties('id', 'schema', 'removeChildren');
				action.payload.id.should.eql(id);
				action.payload.schema.should.eql(mySchema);
				action.payload.removeChildren.should.eql(removeChildren);
			});
		});
	});
});
