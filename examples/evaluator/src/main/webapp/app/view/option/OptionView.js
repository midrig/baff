Ext.define('Evaluator.view.option.OptionView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.optionview',
    
    requires: ['Evaluator.view.option.OptionForm',
                    'Evaluator.view.option.OptionList',
                    'Evaluator.controller.activity.OptionController'],
                
    controller: 'option',
    
    config : {
        
        formPanel: 'optionform',
        listPanel: 'optionlist'
        
    }

    
});

