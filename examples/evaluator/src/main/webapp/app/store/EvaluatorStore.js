Ext.define('Evaluator.store.EvaluatorStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.Evaluator', 
    
    // Default sorter 
    sorters: [{
            property: 'username',
            direction: 'ASC'
    }],

    proxy: {
        type: 'serviceproxy',
        url: 'eval/evaluator/findAll.json'
    }


    
});