Ext.define('Evaluator.view.option.OptionView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.optionview',
    
    requires: ['Evaluator.view.option.OptionForm',
                    'Evaluator.view.option.OptionList',
                    'Evaluator.controller.activity.OptionController'],
    
    config : {
            
        formPanel: 'optionform',
        listPanel: 'optionlist'
        
    },
    
     setupDockedItems: function() {
       var me = this;
       
       var items = me.callParent(arguments);
         
       items.push({  
                        text: 'Abs',
                        iconCls: 'toggle',
                        iconAlign: 'top',
                        itemId: 'toggleRelativeButton',
                        cls: 'baff-button',
                        ui: 'round'
                        },{  
                        text: 'Act',
                        iconCls: 'toggle',
                        iconAlign: 'top',
                        itemId: 'toggleScoreButton',
                        cls: 'baff-button',
                        ui: 'round'
                        },{  
                        text: 'Mine',
                        iconCls: 'user',
                        iconAlign: 'top',
                        itemId: 'toggleScopeButton',
                        cls: 'baff-button',
                        ui: 'round'
                        });
                        
        return items;
   
     }

    
});

