Ext.define('Evaluator.view.chart.ChartPopup', {
    extend: 'Baff.app.view.ActivityPopup',
    
    alias: 'widget.chartpopup',
    
    requires: ['Evaluator.controller.activity.ChartController'],
                
    controller: 'chart',
    
    config : {
        
        title: 'View Chart',
        maximized: true
        
    },
    
    setupDockedItems: function() {
        var me = this;
               
        var dockedItems = me.callParent(arguments);
        
        var toggleScoreBtn = {  
                        xtype: 'button',
                        reference: 'toggleScoreButton',
                        text: "Absolute Scores",
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

