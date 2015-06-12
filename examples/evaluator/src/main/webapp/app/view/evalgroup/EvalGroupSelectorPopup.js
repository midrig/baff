Ext.define('Evaluator.view.evalgroup.EvalGroupSelectorPopup', {
    extend: 'Baff.app.view.SelectorPopup',
    
    alias: 'widget.evalgroupselectorpopup',
    
    requires: ['Evaluator.view.evalgroup.EvalGroupList',
                    'Evaluator.controller.activity.EvalGroupSelectorController'],
                
    controller: 'evalgroupselector',
    
    config : {
    
        title: 'Select Evaluation Group',
        listPanel: 'evalgrouplist',
        addButton: ''
        
    }

    
});

