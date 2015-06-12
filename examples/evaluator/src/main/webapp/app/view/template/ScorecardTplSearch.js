Ext.define('Evaluator.view.template.ScorecardTplSearch', {
    extend: 'Baff.app.view.FilterPanel',
    
    alias: 'widget.scorecardtplsearch',
    
    items: [{
                      fieldLabel: 'Search Name',
                      xtype: 'filterfield',
                      filterFieldName: 'name'
                  },
                  {
                      fieldLabel: 'Search Tags',
                      xtype: 'filterfield',
                      filterFieldName: 'tags'
                  }
              ]

   
});