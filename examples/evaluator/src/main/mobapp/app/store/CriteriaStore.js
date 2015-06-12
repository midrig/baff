Ext.define('Evaluator.store.CriteriaStore', {
    extend: 'Baff.app.model.EntityStore',
    
    config: {
    
        model: 'Evaluator.model.Criteria', 

        // Default sorter 
        sorters: [{
                property: 'name',
                direction: 'ASC'
        }],

        buffered: false,

        proxy: {
            type: 'serviceproxy',
            url: '/evaluator/eval/criteria/findAll.json'
        }
    }
    
});