* _2.1.0_
  entitiesProjector takes an optional array of id strings ([@juanpmarin](https://github.com/juanpmarin)) Closes #18

* _2.0.0_
  * Serialization support for actions. _Details:_  The normalization of entities is now perfomed in the action constructor. Previously it was handled by the reducer. As ([@PachowStudios](https://github.com/PachowStudios)) pointed out in Issue #16, ngrx-normalizr actions were not serializable. This could raise issues with other redux/ngrx libraries. The normalizr `schema.Entity` is not part of the action payload anymore, hence the interfaces for describing the payload have changed and the action constructor does no longer take the payload itself as an argument. As long as you did not type any action parameters in your code or dispatched actions directly with a simle pojo by using the exported action type names, you should have no problem updating, since the arity/keys of the constructor API did not change - see Breaking Changes. Closes #16

  * **Breaking Changes**
    * Action constructor parameters changed from  `NormalizeDataPayload` to `NormalizeActionConfig` and from `NormalizeRemovePayload` to `NormalizeRemoveActionConfig`
    * Action `payload` property types changed from `NormalizeDataPayload` to `NormalizeActionPayload` and from `NormalizeRemovePayload` to `NormalizeRemoveActionPayload`
    * (might break) Internal used interface `SchemaPayload` replaced by `NormalizeActionSchemaConfig`

* _1.0.4_
    * exporting `SchemaSelectors` interface ([@JSantha](https://github.com/JSantha))

* _1.0.3_
    * fixed typos ([@hoisel](https://github.com/hoisel))
    * exporting types for reuse in other libraries

* _1.0.2_
    * improved documentation
    * improved code coverage (100%)
    * `SetData` action for setting entity data instead of updating and adding data

* _1.0.1_
    * `actionCreators` for creating schema bound actions
    * improved code coverage

* _1.0.0_
    * first production version

* _0.0.1_
    * first development version