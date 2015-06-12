Ext.define('Evaluator.store.AnalysisStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.Analysis', 

    config: {
        isBuffered: false
    },
    
    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/analysis/findAllAnalysis.json'
    }

    
});