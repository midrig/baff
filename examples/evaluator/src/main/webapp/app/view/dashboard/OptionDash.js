Ext.define('Evaluator.view.dashboard.OptionDash', {
    extend: 'Baff.app.view.SelectorView',
    
    alias: 'widget.optiondash',
    
    requires: ['Evaluator.view.option.OptionList',
                    'Evaluator.controller.dashboard.OptionDashController'],
                
    controller: 'optiondash',
    
    config : {
        
        listPanel: 'optionlist',
        dashlet: true
        
    }

    
});

