Ext.define('Evaluator.view.evalgroup.EvalGroupForm', {
    extend: 'Baff.app.view.FormPanel',
    
    alias: 'widget.evalgroupform',

            items: [
                          
                {
                xtype: 'fieldset',
                title: 'Group Details',
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