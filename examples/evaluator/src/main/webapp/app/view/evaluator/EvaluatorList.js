Ext.define('Evaluator.view.evaluator.EvaluatorList', {
    extend: 'Baff.app.view.ListPanel',
    
    requires: ['Baff.utility.refdata.RefDataManager', 
        'Evaluator.view.evaluator.EvaluatorSearch'],
    
    alias: 'widget.evaluatorlist',
    
    
        
        title: 'Evaluator List',
        filterPanel: 'evaluatorsearch',
        hideSearchPanel: true,
  
             columns: [{
                text: 'User Name',
                dataIndex: 'username',
                filter: false,                
                hideable: false,               
                flex: 1
                },{
                text: 'Role',
                dataIndex: 'userrole',              
                filter: true,
                hideable: false,               
                flex: 1,
                xtype: 'refdatacolumn',  
                refdataClass: 'EVALGROUP.USERROLE'               
            }]

  
});