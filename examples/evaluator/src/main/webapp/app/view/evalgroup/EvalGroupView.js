Ext.define('Evaluator.view.evalgroup.EvalGroupView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.evalgroupview',
    
    requires: ['Evaluator.view.evalgroup.EvalGroupForm',
                    'Evaluator.view.evalgroup.EvalGroupList',
                    'Evaluator.controller.activity.EvalGroupController'],
                
    controller: 'evalgroup',
    
    config : {
         
        formPanel: 'evalgroupform',
        listPanel: 'evalgrouplist'
        
    }

    
});

