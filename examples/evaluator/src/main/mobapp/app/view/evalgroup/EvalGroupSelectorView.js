Ext.define('Evaluator.view.evalgroup.EvalGroupSelectorView', {
    extend: 'Baff.app.view.SelectorView',
    
    alias: 'widget.evalgroupselectorview',
    
    requires: ['Evaluator.view.evalgroup.EvalGroupList',
                    'Evaluator.controller.activity.EvalGroupSelectorController'],
    
    config : {
       
        listPanel: 'evalgrouplist'
        
    }

    
});

