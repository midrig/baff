Ext.define('Evaluator.view.analysis.AnalysisView', {
    extend: 'Baff.app.view.SelectorView',
    
    alias: 'widget.analysisview',
    
    requires: ['Evaluator.view.analysis.AnalysisList',
                    'Evaluator.controller.activity.AnalysisController'],
    
    config : {
        
        listPanel: 'analysislist'
        
    },
    
     setupDockedItems: function() {
       var me = this;
       
       var items = me.callParent(arguments);
         
       items.push({  
                        text: 'Chart',
                        iconCls: 'chart',
                        iconAlign: 'top',
                        itemId: 'showChartButton',
                        cls: 'baff-button'
                        },
                        {  
                        text: 'Mine',
                        iconCls: 'user',
                        iconAlign: 'top',
                        itemId: 'toggleScopeButton',
                        cls: 'baff-button',
                        ui: 'round'
                        });
                        
        return items;
   
     }
    
});

