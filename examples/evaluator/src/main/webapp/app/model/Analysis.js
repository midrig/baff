Ext.define('Evaluator.model.Analysis', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {   
        masterEntityType: 'Evaluator.model.Scorecard',
        masterEntityIdProperty: 'scorecard.id'
    }, 

    fields: [
        { name: 'category', type: 'string' },
        { name: 'winner', type: 'string' },  
        { name: 'score', type: 'int' },
        { name: 'runnerup', type: 'string' },  
        { name: 'margin', type: 'int' },
        { name: 'isNoOutrightWinner', type: 'boolean' },
        
        { name: 'scorePC', calculate: function(data) {return data.score/100 } },
        { name: 'marginPC', calculate: function(data) {return data.margin/100 } }
        
    ]
    
});
