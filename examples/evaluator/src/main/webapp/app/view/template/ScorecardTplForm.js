Ext.define('Evaluator.view.template.ScorecardTplForm', {
    extend: 'Baff.app.view.FormPanel',
    
    alias: 'widget.scorecardtplform',

            items: [
                          
                {
                xtype: 'fieldset',
                title: 'Template Details',
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
                            fieldLabel: 'Name',
                            reference: 'name'
                        },
                        {
                           xtype: 'textareafield',
                            name: 'description',
                            fieldLabel: 'Description',
                            reference: 'description'
                         },
                         {
                           xtype: 'textfield',
                            name: 'tags',
                            fieldLabel: 'Tags'
                         },
                         {
                           xtype: 'checkboxfield',
                            name: 'isPrivate',
                            fieldLabel: 'Private',
                            boxLabel: 'if checked this template will only be visible to you'
                         },
                         {
                           xtype: 'textfield',
                            name: 'owningUsername',
                            hidden: true,
                            reference: 'username'
                         }
                       
                    ]
                }
            ]     

});