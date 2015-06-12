Ext.define('Evaluator.store.CriteriaTplStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.CriteriaTpl', 
    
    // Default sorter 
    sorters: [{
            property: 'name',
            direction: 'ASC'
    }],

    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/template/criteria/findAll.json'
    }

    
});