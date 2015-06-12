Ext.define('Evaluator.model.Option', {
    extend: 'Baff.app.model.EntityModel',
    alias: 'Option',
 
    statics: {    
        // entityIdProperty: 'id',  -- defaults to this
        masterEntityType: 'Evaluator.model.Scorecard',
        masterEntityIdProperty: 'scorecard.id'
    }, 
    
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

        { name: 'scorePC', calculate: function(data) {return data.score/100 } },
        { name: 'relativeScorePC', calculate: function(data) {return data.relativeScore/100 } },
        { name: 'weightedScorePC', calculate: function(data) {return data.weightedScore/100 } },
        { name: 'relativeWeightedScorePC', calculate: function(data) {return data.relativeWeightedScore/100 } },
        { name: 'balancedScorePC', calculate: function(data) {return data.balancedScore/100 } },
        { name: 'relativeBalancedScorePC', calculate: function(data) {return data.relativeBalancedScore/100 } }

    ],

    validators: [
        { field: 'name', type: 'present' },
        { field: 'name', type: 'length', max: 200 },
        { field: 'description', type: 'length', max: 65535 }
    ],

    proxy: {
        type: 'serviceproxy',
        api:{
            create: 'eval/option/save.json',
            read: 'eval/option/find.json',
            update: 'eval/option/save.json',
            destroy: 'eval/option/remove.json'
        }
    }
    
});
