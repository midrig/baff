Ext.define('Evaluator.view.criteria.CriteriaList', {
    extend: 'Baff.app.view.ListPanel',
    
    alias: 'widget.criterialist',
      
        title: 'Criteria List',
        hideSearchPanel: true,
  
             columns: [{
                text: 'Name',
                dataIndex: 'name',
                filter: false,                
                hideable: false, 
                sortable: false,  
                flex: 2
                },{
                text: 'Weight (Absolute)',
                dataIndex: 'weightPC',
                xtype: 'widgetcolumn',
                widget: {
                    xtype: 'progressbarwidget',
                    textTpl: ['&nbsp{percent:number("0")}%']
                },
                filter: false,
                hideable: false,               
                flex: 3
            },{
                text: 'Weight (Relative)',
                dataIndex: 'relativeWeightPC',
                xtype: 'widgetcolumn',
                widget: {
                    xtype: 'progressbarwidget',
                    textTpl: ['&nbsp{percent:number("0")}%']
                },
                filter: false,
                hideable: false,               
                flex: 3
            }
        ]

  
});