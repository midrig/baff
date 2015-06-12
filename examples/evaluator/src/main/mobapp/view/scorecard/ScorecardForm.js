Ext.define('Evaluator.view.scorecard.ScorecardForm', {
    extend: 'Baff.app.view.FormPanel',
    
    alias: 'widget.scorecardform',
    
    config: {

        items: [

            {
            xtype: 'fieldset',
            title: 'Scorecard Details',
            
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