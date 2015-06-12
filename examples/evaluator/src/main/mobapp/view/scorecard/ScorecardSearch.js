Ext.define('Evaluator.view.scorecard.ScorecardSearch', {
    extend: 'Baff.app.view.FilterPanel',
    
    alias: 'widget.scorecardsearch',
   
    config: {
   
            items: [{
                        label: 'Search Name',
                        xtype: 'filterfield',
                        filterFieldName: 'name'
                    }
                ]
    }
   
});