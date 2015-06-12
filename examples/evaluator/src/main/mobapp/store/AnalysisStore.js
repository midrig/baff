Ext.define('Evaluator.store.AnalysisStore', {
    extend: 'Baff.app.model.EntityStore',

    config: {
        
        model: 'Evaluator.model.Analysis', 
        
        buffered: false,

        proxy: {
            type: 'serviceproxy',
            url: '/evaluator/eval/analysis/findAllAnalysis.json'
        }
     }
    
});