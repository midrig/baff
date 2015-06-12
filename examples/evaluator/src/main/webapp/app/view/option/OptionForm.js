Ext.define('Evaluator.view.option.OptionForm', {
    extend: 'Baff.app.view.FormPanel',
    
    alias: 'widget.optionform',

            items: [
                          
                {
                xtype: 'fieldset',
                title: 'Option Details',
                padding: 10,
                fieldDefaults: {
                    anchor: '100%'
                    },
                layout: 'anchor', 
                collapsible: false,
                items: [
                    
                        {    
                            xtype: 'textfield',
                            name: 'name',
                            fieldLabel: 'Name'
                        },
                        {
                           xtype: 'textareafield',
                            name: 'description',
                            fieldLabel: 'Description'
                         }
                       
                    ]
                }
            ]     

});