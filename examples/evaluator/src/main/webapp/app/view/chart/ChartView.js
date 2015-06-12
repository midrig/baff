Ext.define('Evaluator.view.chart.ChartView', {
    extend: 'Baff.app.view.ActivityView',
    
    alias: 'widget.chartview',
    
    requires: ['Evaluator.controller.activity.ChartController'],
                
    controller: 'chart',
    
    setupDockedItems: function() {
        var me = this;
               
        var dockedItems = me.callParent(arguments);
        
        var toggleScoreBtn = {  
                        xtype: 'button',
                        reference: 'toggleScoreButton',
                        text: "Actual Scores",
                        handler: 'onToggleScore',
                        tooltip: 'Click to view weighted scores'
                        };
                        
        var toggleSoreScopeBtn = {  
                        xtype: 'button',
                        reference: 'toggleSoreScopeButton',
                        text: "My Scores",
                        handler: 'onToggleScoreScope',
                        tooltip: 'Click to view all scores'
                        };       
        
        dockedItems.push('->', toggleScoreBtn, toggleSoreScopeBtn, ' ');
        
        return dockedItems;
                
               
    }
    
    
    
});

