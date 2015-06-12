Ext.define('Evaluator.view.dashboard.MainDashboard', {
    extend: 'Baff.app.view.DashboardView',
    
    alias: 'widget.maindashboard',
    
    requires: ['Evaluator.controller.dashboard.MainDashboardController',
                    'Evaluator.view.dashboard.EvalGroupDash',
                    'Evaluator.view.dashboard.ScorecardDash',
                    'Evaluator.view.dashboard.OptionDash'],
      
    
    config: {
     
        controller: 'maindashboard',
        
        items: [{
           // Row 1
           flex:1,
           cls: 'x-tab x-tab-active x-tab-default',
           layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                xtype: 'evalgroupdash',
                dashlet: true,
                flex: 1
                },{
                xtype: 'scorecarddash',
                dashlet: true,
                reference: 'scorecarddash',
                flex: 1
                }
            ]}, {
            // Row 2
            flex: 1,
           layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                xtype: 'optiondash',
                reference: 'optiondash',
                flex: 1
                }]
            }
        ]
    }
 
});