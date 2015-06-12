Ext.define('Evaluator.view.score.ScoreList', {
    extend: 'Baff.app.view.ListPanel',
    
    alias: 'widget.scorelist',
      
        title: 'Score List',
        
             columns: [{
                text: 'Criteria',
                dataIndex: 'criteria.name',
                filter: false,                
                hideable: false,
                sortable: false,
                flex: 2,
                reference: 'criteriaCol'
                },{
                text: 'Option',
                dataIndex: 'option.name',              
                filter: false,
                hideable: false,  
                sortable: false,  
                flex: 2,
                reference: 'optionCol'
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
                flex: 3
            },{
                text: 'Weighted Score (Absolute)',
                dataIndex: 'weightedScorePC',
                xtype: 'widgetcolumn',
                reference: 'weightedCol',
                widget: {
                    xtype: 'progressbarwidget',
                    textTpl: ['&nbsp{percent:number("0")}%']
                },
                filter: false,
                hideable: false,     
                hidden: true,
                flex: 3
            },{
                text: 'Score (Relative)',
                dataIndex: 'relativeScorePC',
                xtype: 'widgetcolumn',
                reference: 'relAbsoluteCol',
                widget: {
                    xtype: 'progressbarwidget',
                    textTpl: ['&nbsp{percent:number("0")}%']
                },
                filter: false,
                hideable: false,    
                flex: 3
            },{
                text: 'Weighted Score (Relative)',
                dataIndex: 'relativeWeightedScorePC',
                xtype: 'widgetcolumn',
                reference: 'relWeightedCol',
                widget: {
                    xtype: 'progressbarwidget',
                    textTpl: ['&nbsp{percent:number("0")}%']
                },
                filter: false,
                hideable: false,  
                hidden: true,
                flex: 3
            },
            {
                xtype: 'actioncolumn',
                filter: false,
                width: 30,
                hideable: false,
                items: [{
                        icon: 'resources/baff/go.png',
                        handler: 'onEvalScoreButton',
                        tooltip: 'View all scores for given option and criteria'
                }]
            }
                
     ],
        
        initComponent: function() {
            var me = this;
            
            me.callParent(arguments);
            
            me.addTool([{
                type: 'gear',
                itemId: 'toggleScore',
                callback: 'onToggleScore',
                tooltip: 'Toggle Score',
                reference: 'toggleButton'
            },{
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