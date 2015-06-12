Ext.define('Evaluator.store.ChartStore', {
    extend: 'Baff.app.model.EntityStore',

    config: {
        model: 'Evaluator.model.Chart', 
         
        buffered: false,
        
        proxy: {
            type: 'serviceproxy',
            url: '/evaluator/eval/analysis/findChartSeries.json'
        }
    }


    
});