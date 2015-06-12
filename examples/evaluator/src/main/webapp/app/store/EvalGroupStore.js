Ext.define('Evaluator.store.EvalGroupStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.EvalGroup', 
    
    // Default sorter 
    sorters: [{
            property: 'name',
            direction: 'ASC'
    }],

    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/evalGroup/findByEvaluator.json'
    }

    
});