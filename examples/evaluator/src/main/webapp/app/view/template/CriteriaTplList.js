Ext.define('Evaluator.view.template.CriteriaTplList', {
    extend: 'Baff.app.view.ListPanel',
    
    alias: 'widget.criteriatpllist',
      
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
                flex: 3,
                reference: 'absWeightCol'
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
                flex: 2,
                reference: 'relWeightCol'
                },{
                text: 'Description',
                dataIndex: 'description',              
                filter: false,
                hideable: false,               
                flex: 6,
                cellWrap: true,
                sortable: false
                }
        ]

  
});