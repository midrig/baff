Ext.define('Evaluator.view.evalscore.EvalScoreSearch', {
    extend: 'Baff.app.view.FilterPanel',
    
    alias: 'widget.evalscoresearch',
    
    fieldDefaults: {
            labelWidth: 150
        },
    
    items: [{
                      fieldLabel: 'Search Username',
                      xtype: 'filterfield',
                      filterFieldName: 'evaluator.username'
                  }
              ]

   
});