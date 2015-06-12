Ext.define('Evaluator.model.Score', {
    extend: 'Baff.app.model.EntityModel',
    alias: 'Score',
 
    statics: {   
        primaryStoreType: 'Evaluator.store.ScoreStore'
    }, 

    fields: [
        { name: 'id', type: 'int', allowNull: true },
        { name: 'notes', type: 'string' },
        { name: 'lastUpdated', type: 'string' },  
        { name: 'criteria.id', type: 'int', allowNull: true },
        { name: 'option.id', type: 'int', allowNull: true },
        { name: 'evaluator.id', type: 'int', allowNull: true },
        { name: 'criteria.name', type: 'string' },
        { name: 'option.name', type: 'string' },
        { name: 'evaluator.name', type: 'string' },

        { name: 'score', type: 'int' },
        { name: 'relativeScore', type: 'int' },
        { name: 'weightedScore', type: 'int' },
        { name: 'relativeWeightedScore', type: 'int' },

        { name: 'scorePC', calculate: function(data) {return data.score/100 } },
        { name: 'relativeScorePC', calculate: function(data) {return data.relativeScore/100 } },
        { name: 'weightedScorePC', calculate: function(data) {return data.weightedScore/100 } },
        { name: 'relativeWeightedScorePC', calculate: function(data) {return data.relativeWeightedScore/100 } }

    ],

    validators: [
        { field: 'name', type: 'present' },
        { field: 'name', type: 'length', max: 200 },
        { field: 'notes', type: 'length', max: 65535 }
    ],

    proxy: {
        type: 'serviceproxy',
        api:{
            create: 'eval/score/save.json',
            read: 'eval/score/find.json',
            update: 'eval/score/save.json',
            destroy: 'eval/score/remove.json'
        }
    }
    
});
