Ext.define('Evaluator.view.chart.ChartView', {
    extend: 'Baff.app.view.ActivityView',
    
    alias: 'widget.chartview',
   
    
    setupDockedItems: function() {
        var me = this;
               
       var items = me.callParent(arguments);
         
       items.push({  
                        text: 'Act',
                        iconCls: 'toggle',
                        iconAlign: 'top',
                        itemId: 'toggleScoreButton',
                        cls: 'baff-button',
                        ui: 'round'
                        },{  
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

