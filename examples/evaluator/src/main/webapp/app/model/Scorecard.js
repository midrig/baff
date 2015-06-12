Ext.define('Evaluator.model.Scorecard', {
    extend: 'Baff.app.model.EntityModel',
    alias: 'Scorecard',
 
    statics: {                
        masterEntityType: 'Evaluator.model.Scorecard',
        primaryStoreType: 'Evaluator.store.ScorecardStore'
    }, 

    fields: [
        { name: 'id', type: 'int', allowNull: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'lastUpdated', type: 'string' },
        { name: 'evalGroup.id', type: 'int', allowNull: true }

    ],

    validators: [
        { field: 'name', type: 'present' },
        { field: 'name', type: 'length', max: 200 },
        { field: 'description', type: 'length', max: 65535 }
    ],

    proxy: {
        type: 'serviceproxy',
        api:{
            create: 'eval/scorecard/save.json',
            read: 'eval/scorecard/find.json',
            update: 'eval/scorecard/save.json',
            destroy: 'eval/scorecard/remove.json'
        }
    }
    
});
