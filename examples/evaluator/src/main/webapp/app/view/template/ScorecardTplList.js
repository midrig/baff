Ext.define('Evaluator.view.template.ScorecardTplList', {
    extend: 'Baff.app.view.ListPanel',
    
    requires: ['Evaluator.view.template.ScorecardTplSearch'],
    
    alias: 'widget.scorecardtpllist',
        
        title: 'Scorecard Template List',
        filterPanel: 'scorecardtplsearch',
        hideSearchPanel: true,
  
             columns: [{
                text: 'Name',
                dataIndex: 'name',
                filter: false,                
                hideable: false,               
                flex: 3
                },{
                text: 'Description',
                dataIndex: 'description',              
                filter: false,
                hideable: false,               
                flex: 6,
                cellWrap: true,
                sortable: false
                },{
                text: 'Tags',
                dataIndex: 'tags',              
                filter: false,
                hideable: false,               
                flex: 4,
                cellWrap: true,
                sortable: false,
                reference: 'tagCol'
                },{
                text: 'Owner',
                dataIndex: 'owningUsername',              
                filter: true,
                trueText: 'Yes',
                falseText: 'No',
                hideable: false,
                reference: 'ownerCol',
                flex: 2
                },{
                xtype: 'booleancolumn',
                text: 'Private',
                dataIndex: 'isPrivate',              
                filter: true,
                trueText: 'Yes',
                falseText: 'No',
                hideable: false,
                width: 100
                },
                {
                xtype: 'actioncolumn',
                filter: false,
                hideable: false,
                reference: 'actionCol',
                width: 30,
                items: [{
                        icon: 'resources/baff/go.png',
                        handler: 'onCriteriaButton',
                        tooltip: 'Click to view criteria for the scorecard'
                    }]
                }
            ]

  
});