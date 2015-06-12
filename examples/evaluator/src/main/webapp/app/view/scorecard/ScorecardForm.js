Ext.define('Evaluator.view.scorecard.ScorecardForm', {
    extend: 'Baff.app.view.FormPanel',
    
    alias: 'widget.scorecardform',

            items: [
                          
                {
                xtype: 'fieldset',
                title: 'Scorecard Details',
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
                         }
                       
                    ]
                },
                {
                    xtype: 'component',
                    reference: 'templateText'
                }
            ]     

});