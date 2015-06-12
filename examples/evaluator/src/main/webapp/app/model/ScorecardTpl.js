Ext.define('Evaluator.model.ScorecardTpl', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {                
        masterEntityType: 'Evaluator.model.ScorecardTpl',
        entityIdProperty: 'scorecardTplId',
        primaryStoreType: 'Evaluator.store.ScorecardTplStore'
    }, 

    fields: [
        { name: 'id', type: 'int', allowNull: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'owningUsername', type: 'string' },
        { name: 'tags', type: 'string' },
        { name: 'isPrivate', type: 'boolean' },
        { name: 'lastUpdated', type: 'string' }

    ],

    validators: [
        { field: 'name', type: 'present' },
        { field: 'name', type: 'length', max: 200 },
        { field: 'description', type: 'length', max: 65535 },
        { field: 'tags', type: 'length', max: 100 }
    ],

    proxy: {
        type: 'serviceproxy',
        api:{
            read: 'eval/scorecard/find.json',
            update: 'eval/template/scorecard/save.json',
            destroy: 'eval/template/scorecard/remove.json'
        }
    }
    
});
