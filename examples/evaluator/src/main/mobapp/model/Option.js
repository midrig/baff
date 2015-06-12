Ext.define('Evaluator.model.Option', {
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

            { name: 'score', type: 'int' },
            { name: 'relativeScore', type: 'int' },
            { name: 'weightedScore', type: 'int' },
            { name: 'relativeWeightedScore', type: 'int' },
            { name: 'balancedScore', type: 'int' },
            { name: 'relativeBalancedScore', type: 'int' },

            { name: 'scorePC', convert: function(value, record) {return record.data.score/100 } },
            { name: 'relativeScorePC', convert: function(value, record) {return record.data.relativeScore/100 } },
            { name: 'weightedScorePC', convert: function(value, record) {return record.data.weightedScore/100 } },
            { name: 'relativeWeightedScorePC', convert: function(value, record) {return record.data.relativeWeightedScore/100 } },
            { name: 'balancedScorePC', convert: function(value, record) {return record.data.balancedScore/100 } },
            { name: 'relativeBalancedScorePC', convert: function(value, record) {return record.data.relativeBalancedScore/100 } }

        ],

        validators: [
            { field: 'name', type: 'present' },
            { field: 'name', type: 'length', max: 200 },
            { field: 'description', type: 'length', max: 65535 }
        ],

        proxy: {
            type: 'serviceproxy',
            api:{
                create: '/evaluator/eval/option/save.json',
                read: '/evaluator/eval/option/find.json',
                update: '/evaluator/eval/option/save.json',
                destroy: '/evaluator/eval/option/remove.json'
            }
        }
    }
    
});
