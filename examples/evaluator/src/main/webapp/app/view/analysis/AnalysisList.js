Ext.define('Evaluator.view.analysis.AnalysisList', {
    extend: 'Baff.app.view.ListPanel',
    
    alias: 'widget.analysislist',
      
        title: 'Analysis List',
        
             columns: [{
                text: 'Category',
                dataIndex: 'category',
                filter: false,                
                hideable: false,
                sortable: false,  
                flex: 2
                },{
                text: 'Winner',
                dataIndex: 'winner',              
                filter: false,
                hideable: false,  
                sortable: false,  
                flex: 2
                },{
                text: 'Score',
                dataIndex: 'scorePC',
                xtype: 'widgetcolumn',
                widget: {
                    xtype: 'progressbarwidget',
                    textTpl: ['&nbsp{percent:number("0")}%']
                },
                filter: false,
                hideable: false,               
                flex: 4
                },{
                text: 'Runner Up',
                dataIndex: 'runnerup',              
                filter: false,
                hideable: false,  
                sortable: false,  
                flex: 2
                },{
                text: 'Margin',
                xtype: 'templatecolumn',
                tpl:  ['{margin}%'],
                filter: false,
                hideable: false,  
                sortable: false,  
                flex: 1
                }
     ],
        
        initComponent: function() {
            var me = this;
            
            me.callParent(arguments);
            
            me.addTool([{
                type: 'plus',
                itemId: 'allScores',
                callback: 'onAllScores',
                tooltip: 'View All Scores',
                reference: 'allScoresButton'
            },{
                type: 'minus',
                itemId: 'myScores',
                callback: 'onMyScores',
                tooltip: 'View My Scores',
                reference: 'myScoresButton',
                hidden: true
            }
            ]);
         
        }
  
});