Ext.define('Evaluator.model.Score', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {   
        primaryStoreType: 'Evaluator.store.ScoreStore'
    }, 

    config: {

        fields: [
            { name: 'id', type: 'int', allowNull: true },
            { name: 'notes', type: 'string' },
            { name: 'lastUpdated', type: 'string' },  
            { name: 'criteria.id', type: 'int', allowNull: true },
            { name: 'option.id', type: 'int', allowNull: true },
            { name: 'evaluator.id', type: 'int', allowNull: true },
            { name: 'criteria.name', type: 'string' },
            { name: 'option.name', type: 'string' },

            { name: 'score', type: 'int' },
            { name: 'relativeScore', type: 'int' },
            { name: 'weightedScore', type: 'int' },
            { name: 'relativeWeightedScore', type: 'int' },

            { name: 'scorePC', convert: function(value, record) {return record.data.score/100 } },
            { name: 'relativeScorePC', convert: function(value, record) {return record.data.relativeScore/100 } },
            { name: 'weightedScorePC', convert: function(value, record) {return record.data.weightedScore/100 } },
            { name: 'relativeWeightedScorePC', convert: function(value, record) {return record.data.relativeWeightedScore/100 } }

        ],

        validators: [
            { field: 'name', type: 'present' },
            { field: 'name', type: 'length', max: 200 },
            { field: 'notes', type: 'length', max: 65535 }
        ],

        proxy: {
            type: 'serviceproxy',
            api:{
                create: '/evaluator/eval/score/save.json',
                read: '/evaluator/eval/score/find.json',
                update: '/evaluator/eval/score/save.json',
                destroy: '/evaluator/eval/score/remove.json'
            }
        }
    }
    
});
