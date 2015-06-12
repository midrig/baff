Ext.define('Evaluator.view.evaluator.EvaluatorView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.evaluatorview',
    
    requires: ['Evaluator.view.evaluator.EvaluatorForm',
                    'Evaluator.view.evaluator.EvaluatorList',
                    'Evaluator.controller.activity.EvaluatorController'],
                
    controller: 'evaluator',
    
    config : {
          
        formPanel: 'evaluatorform',
        listPanel: 'evaluatorlist'
        
    }

    
});

