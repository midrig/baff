Ext.define('Evaluator.view.scorecard.ScorecardList', {
    extend: 'Baff.app.view.ListPanel',
    
    requires: ['Evaluator.view.scorecard.ScorecardSearch'],
    
    alias: 'widget.scorecardlist',
        
        title: 'Scorecard List',
        filterPanel: 'scorecardsearch',
        hideSearchPanel: true,
  
             columns: [{
                text: 'Name',
                dataIndex: 'name',
                filter: false,                
                hideable: false,               
                flex: 2
                },{
                text: 'Description',
                dataIndex: 'description',              
                filter: false,
                hideable: false,   
                sortable: false,
                flex: 3
                },{
                xtype: 'actioncolumn',
                icon: 'resources/baff/go.png',
                handler: 'onScorecardListButton',
                tooltip: 'View this scorecard',
                filter: false,
                hideable: false,
                width: 30,
                reference: 'actionCol'
            }
            ]

  
});