Ext.define('Evaluator.store.ScorecardTplStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.ScorecardTpl', 
    
    // Default sorter 
    sorters: [{
            property: 'name',
            direction: 'ASC'
    }],

    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/template/scorecard/findAll.json'
    }

    
});