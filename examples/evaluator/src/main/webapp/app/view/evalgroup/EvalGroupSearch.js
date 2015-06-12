Ext.define('Evaluator.view.evalgroup.EvalGroupSearch', {
    extend: 'Baff.app.view.FilterPanel',
    
    alias: 'widget.evalgroupsearch',
   
            items: [{
                        fieldLabel: 'Search Name',
                        xtype: 'filterfield',
                        filterFieldName: 'name'
                    }]

   
});