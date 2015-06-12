Ext.define('Evaluator.view.evalgroup.EvalGroupSearch', {
    extend: 'Baff.app.view.FilterPanel',
    
    alias: 'widget.evalgroupsearch',
    
    config: {
   
            items: [{
                        label: 'Search Name',
                        xtype: 'filterfield',
                        filterFieldName: 'name'
                    }]
    }
   
});