Ext.define('Evaluator.store.ScorecardStore', {
    extend: 'Baff.app.model.EntityStore', 
    
    config: {
        
         model: 'Evaluator.model.Scorecard', 

        // Default sorter 
        sorters: [{
                property: 'name',
                direction: 'ASC'
        }],
    
        
        proxy: {
            type: 'serviceproxy',
            url: '/evaluator/eval/scorecard/findAll.json'
        }
    }

    
});