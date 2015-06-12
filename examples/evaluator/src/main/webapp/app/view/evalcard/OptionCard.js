Ext.define('Evaluator.view.evalcard.OptionCard', {
    extend: 'Baff.app.view.FormView',
    
    alias: 'widget.optioncard',
    
    requires: ['Evaluator.view.option.OptionForm',
                    'Evaluator.controller.evalcard.OptionCardController'],
                
    controller: 'optioncard',
    
    config : {
        
        formPanel: 'optionform'
        
    }

    
});

