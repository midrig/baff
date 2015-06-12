Ext.define('Evaluator.model.Scorecard', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {                
        masterEntityType: 'Evaluator.model.Scorecard',
        primaryStoreType: 'Evaluator.store.ScorecardStore'
    }, 
    
    config: {

        fields: [
            { name: 'id', type: 'int', allowNull: true },
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'lastUpdated', type: 'string' },
            { name: "evalGroup.id", type: 'int', allowNull: true }

        ],

        validators: [
            { field: 'name', type: 'present' },
            { field: 'name', type: 'length', max: 200 },
            { field: 'description', type: 'length', max: 65535 }
        ],

        proxy: {
            type: 'serviceproxy',
            api:{
                create: '/evaluator/eval/scorecard/save.json',
                read: '/evaluator/eval/scorecard/find.json',
                update: '/evaluator/eval/scorecard/save.json',
                destroy: '/evaluator/eval/scorecard/remove.json'
            }
        }
    }
    
});
