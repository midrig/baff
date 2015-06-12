Ext.define('Evaluator.view.template.CriteriaTplView', {
    extend: 'Baff.app.view.SelectorView',
    
    alias: 'widget.criteriatplview',
    
    requires: ['Evaluator.view.template.CriteriaTplList',
                    'Evaluator.controller.activity.CriteriaTplController'],
                
    controller: 'criteriatpl',
    
    config : {
        
        listPanel: 'criteriatpllist',
        addButton: '',
        refreshButton: ''
        
    }

    
});

