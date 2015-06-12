Ext.define('Evaluator.store.OptionStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.Option', 
    
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
        url: '/evaluator/eval/option/findAll.json'
    }

    
});