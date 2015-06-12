Ext.define('Evaluator.view.scorecard.ScorecardSearch', {
    extend: 'Baff.app.view.FilterPanel',
    
    alias: 'widget.scorecardsearch',
    
    items: [{
                      fieldLabel: 'Search Name',
                      xtype: 'filterfield',
                      filterFieldName: 'name'
                  }
              ]

   
});