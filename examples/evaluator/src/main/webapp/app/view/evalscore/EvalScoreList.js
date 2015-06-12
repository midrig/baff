Ext.define('Evaluator.view.evalscore.EvalScoreList', {
    extend: 'Baff.app.view.ListPanel',
    
    requires: ['Evaluator.view.evalscore.EvalScoreSearch'],
    
    alias: 'widget.evalscorelist',
      
        title: 'Score List for All Evaluators',
        filterPanel: 'evalscoresearch',
        hideSearchPanel: true,
        
             columns: [{
                text: 'User Name',
                dataIndex: 'evaluator.username',
                filter: false,                
                hideable: false,
                sortable: true,  
                flex: 2
                },{
                text: 'Score (Absolute)',
                dataIndex: 'scorePC',
                xtype: 'widgetcolumn',
                reference: 'absoluteCol',
                widget: {
                    xtype: 'progressbarwidget',
                    textTpl: ['&nbsp{percent:number("0")}%']
                },
                filter: false,
                hideable: false,               
                flex: 5
                },{
                text: 'Notes',
                dataIndex: 'notes',
                filter: false,                
                hideable: false,
                sortable: false,  
                flex: 7,
                cellWrap: true
       
                }
     ]
       
  
});