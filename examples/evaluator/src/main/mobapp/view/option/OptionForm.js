Ext.define('Evaluator.view.option.OptionForm', {
    extend: 'Baff.app.view.FormPanel',
    
    alias: 'widget.optionform',
    
    config: {

            items: [
                          
                {
                xtype: 'fieldset',
                title: 'Option Details',
                
                items: [
                    
                        {    
                            xtype: 'textfield',
                            name: 'name',
                            label: 'Name'
                        },
                        {
                           xtype: 'textareafield',
                            name: 'description',
                            label: 'Description'
                         }
                       
                    ]
                }
            ]    
    }

});