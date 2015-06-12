Ext.define('Evaluator.view.evalgroup.EvalGroupList', {
    extend: 'Baff.app.view.ListPanel',
    
    requires: ['Evaluator.view.evalgroup.EvalGroupSearch'],
    
    alias: 'widget.evalgrouplist',
    
    
        
        title: 'Evaluation Group List',
        filterPanel: 'evalgroupsearch',
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
                sortable: false,                
                filter: false,
                hideable: false,               
                flex: 3              
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