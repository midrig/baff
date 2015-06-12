Ext.define('Evaluator.store.OptionStore', {
    extend: 'Baff.app.model.EntityStore',
    
    config: {
    
        model: 'Evaluator.model.Option', 

        // Default sorter 
        sorters: [{
                property: 'name',
                direction: 'ASC'
        }],
    
        buffered: false,

        proxy: {
            type: 'serviceproxy',
            url: '/evaluator/eval/option/findAll.json'
        }
    }

    
});