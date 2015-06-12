Ext.define('Evaluator.view.template.CriteriaTplPopup', {
    extend: 'Baff.app.view.SelectorPopup',
    
    alias: 'widget.criteriatplpopup',
    
    requires: ['Evaluator.view.template.CriteriaTplList',
                    'Evaluator.controller.activity.CriteriaTplSelectorController'],
    
    controller: 'criteriatplselector',
    
    config : {
    
        title: 'View Criteria (Template)',
        listPanel: 'criteriatpllist',
        refreshButton: '',
        addButton: '',
        selectButton: ''
        
    }
    
});

