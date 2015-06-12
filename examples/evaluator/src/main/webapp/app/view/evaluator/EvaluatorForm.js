Ext.define('Evaluator.view.evaluator.EvaluatorForm', {
    extend: 'Baff.app.view.FormPanel',
    
    alias: 'widget.evaluatorform',

            items: [
                          
                {
                xtype: 'fieldset',
                title: 'Evaluator Details',
                padding: 10,
                fieldDefaults: {
                    anchor: '100%'
                    },
                layout: 'anchor', 
                collapsible: false,
                items: [
                    
                        {    
                            xtype: 'textfield',
                            name: 'username',
                            fieldLabel: 'User Name'
                        },
                        {
                            xtype: 'refdatacombobox',
                            name: 'userrole',
                            fieldLabel: 'User Role',
                            refdataClass: 'EVALGROUP.USERROLE',
                            reference: 'roleCombo',
                            flex: 1
                         }
                       
                    ]
                }
            ]     

});