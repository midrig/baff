Ext.define('Evaluator.store.CriteriaStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.Criteria', 
    
    // Default sorter 
    sorters: [{
            property: 'name',
            direction: 'ASC'
    }],

    config: {
        isBuffered: false
    },

    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/criteria/findAll.json'
    }

    
});