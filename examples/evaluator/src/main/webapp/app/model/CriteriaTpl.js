Ext.define('Evaluator.model.CriteriaTpl', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {    
        // entityIdProperty: 'id',  -- defaults to this
        masterEntityType: 'Evaluator.model.ScorecardTpl',
        masterEntityIdProperty: 'scorecard.id'
    }, 

    fields: [
        { name: 'id', type: 'int', allowNull: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'lastUpdated', type: 'string' },        
        { name: 'scorecard.id', type: 'int', allowNull: true },

        { name: 'weight', type: 'int', defaultValue: 100 },
        { name: 'relativeWeight', type: 'int' },

        { name: 'weightPC', calculate: function(data) {return data.weight/100  } },
        { name: 'relativeWeightPC', calculate: function(data) {return data.relativeWeight/100  } }

    ]
    
});
