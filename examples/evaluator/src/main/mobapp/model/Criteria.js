Ext.define('Evaluator.model.Criteria', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {    
        // entityIdProperty: 'id',  -- defaults to this
        masterEntityType: 'Evaluator.model.Scorecard',
        masterEntityIdProperty: 'scorecard.id'
    }, 
    
    config: {

        fields: [
            { name: 'id', type: 'int', allowNull: true },
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'lastUpdated', type: 'string' },        
            { name: 'scorecard.id', type: 'int', allowNull: true },

            { name: 'weight', type: 'int', defaultValue: 100 },
            { name: 'relativeWeight', type: 'int' },

            { name: 'weightPC', convert: function(value, record) {return record.data.weight/100  } },
            { name: 'relativeWeightPC', convert: function(value, record) {return record.data.relativeWeight/100  } }

        ],

        validators: [
            { field: 'name', type: 'present' },
            { field: 'name', type: 'length', max: 200 },
            { field: 'description', type: 'length', max: 65535 }
        ],

        proxy: {
            type: 'serviceproxy',
            api:{
                create: '/evaluator/eval/criteria/save.json',
                read: '/evaluator/eval/criteria/find.json',
                update: '/evaluator/eval/criteria/save.json',
                destroy: '/evaluator/eval/criteria/remove.json'
            }
        }
    }
    
});
