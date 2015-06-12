Ext.define('Evaluator.view.evalcard.EvalGroupCard', {
    extend: 'Baff.app.view.FormView',
    
    alias: 'widget.evalgroupcard',
    
    requires: ['Evaluator.view.evalgroup.EvalGroupForm',
                    'Evaluator.controller.evalcard.EvalGroupCardController'],
                
    controller: 'evalgroupcard',
    
    config : {
         
        formPanel: 'evalgroupform'
        
    }

    
});

