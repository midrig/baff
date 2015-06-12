Ext.define('Evaluator.view.evalcard.EvalTreeView', {
    extend: 'Baff.app.view.SelectorView',
    
    alias: 'widget.evaltreeview',
    
    requires: ['Evaluator.controller.evalcard.EvalTreeController',
                    'Evaluator.view.evalcard.EvalTreePanel'],
                
    controller: 'evaltree',
    addButton: '',
    
    config: {
        listPanel: 'evaltreepanel'
    }
    
});

