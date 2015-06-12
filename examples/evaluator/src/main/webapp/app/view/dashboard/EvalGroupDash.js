Ext.define('Evaluator.view.dashboard.EvalGroupDash', {
    extend: 'Baff.app.view.SelectorView',
    
    alias: 'widget.evalgroupdash',
    
    requires: ['Evaluator.view.evalgroup.EvalGroupList',
                    'Evaluator.controller.dashboard.EvalGroupDashController'],
                
    controller: 'evalgroupdash',
    
    config : {
         
        listPanel: 'evalgrouplist'
        
    }

    
});
