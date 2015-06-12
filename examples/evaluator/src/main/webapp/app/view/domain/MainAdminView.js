Ext.define('Evaluator.view.domain.MainAdminView', {
    extend: 'Baff.app.view.DomainView',
    
    alias: 'widget.mainadminview',
    
    requires: ['Evaluator.controller.domain.MainAdminController',
                    'Evaluator.view.evalgroup.EvalGroupView',
                    'Evaluator.view.evaluator.EvaluatorView'],
                
    config: {
    
        controller: 'mainadmin',
        
        items: [{
                title: 'Evaluation Groups',
                xtype: 'evalgroupview'
            },{
                title: 'Evaluators',
                xtype: 'evaluatorview'
            }
       
        ]
    }
 
});