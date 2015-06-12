Ext.define('Evaluator.store.ChartStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.Chart', 

    config: {
        isBuffered: false
    },

    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/analysis/findChartSeries.json'
    }

    
});