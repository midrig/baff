Ext.define('Evaluator.view.analysis.AnalysisView', {
    extend: 'Baff.app.view.SelectorView',
    
    alias: 'widget.analysisview',
    
    requires: ['Evaluator.view.analysis.AnalysisList',
                    'Evaluator.controller.activity.AnalysisController',
                    'Evaluator.view.chart.ChartPopup'],
                
    controller: 'analysis',
    
    config : {
  
        listPanel: 'analysislist',
        addButton: ''
        
    },
    
    setupDockedItems: function() {
        var me = this;
               
        var dockedItems = me.callParent(arguments);
        
        var chartBtn = {  
                        xtype: 'button',
                        reference: 'chartButton',
                        text: "View Chart",
                        handler: 'onChartButton',
                        tooltip: 'Click to view spider graph',
                        iconCls: 'chart'
                        };
          
        dockedItems.push('->', chartBtn,' ');
        
        return dockedItems;
    }
    
});

