Ext.define('Evaluator.view.criteria.CriteriaView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.criteriaview',
    
    requires: ['Evaluator.view.criteria.CriteriaForm',
                    'Evaluator.view.criteria.CriteriaList',
                    'Evaluator.controller.activity.CriteriaController'],
                
    controller: 'criteria',
    
    config : {
        
        formPanel: 'criteriaform',
        listPanel: 'criterialist'
        
    }

    
});

