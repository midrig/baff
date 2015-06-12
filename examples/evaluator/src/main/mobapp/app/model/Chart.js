Ext.define('Evaluator.model.Chart', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {   
        masterEntityType: 'Evaluator.model.Scorecard',
        masterEntityIdProperty: 'scorecard.id'
    },
    
    config: {
        setDataFromRaw: true
    }
    
});
