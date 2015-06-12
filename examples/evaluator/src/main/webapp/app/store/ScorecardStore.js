Ext.define('Evaluator.store.ScorecardStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.Scorecard', 
    
    // Default sorter 
    sorters: [{
            property: 'name',
            direction: 'ASC'
    }],

    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/scorecard/findAll.json'
    },
    
    //pageSize: 5,
    
    // Other Ext.data.BufferedStore configurations to manage buffer processing
    //leadingBufferZone: 1,
    //trailingBufferZone: 10,
    //purgePageCount: 1,

    
});