Ext.define('Evaluator.view.evaluator.EvaluatorSearch', {
    extend: 'Baff.app.view.FilterPanel',
    
    alias: 'widget.evaluatorsearch',
   
            items: [{
                        fieldLabel: 'Search User Name',
                        xtype: 'filterfield',
                        filterFieldName: 'username'
                    },{
                        fieldLabel: 'Filter Role',
                        xtype: 'refdatafilter',
                        refdataClass: 'EVALGROUP.USERROLE',
                        filterFieldName: 'userrole'
                    }
                ]

   
});