Ext.define('Evaluator.view.score.ScoreForm', {
    extend: 'Baff.app.view.FormPanel',
    requires: ['Ext.slider.Single'],
    
    alias: 'widget.scoreform',

            items: [
                          
                {
                xtype: 'fieldset',
                title: 'Score Details',
                padding: 10,
                fieldDefaults: {
                    anchor: '100%'
                    },
                layout: 'anchor', 
                collapsible: false,
                items: [
                        {
                           xtype: 'sliderfield',
                            name: 'score',
                            fieldLabel: 'Score',
                            minValue: 0,
                            maxValue: 100
                         },
                        {
                           xtype: 'textareafield',
                            name: 'notes',
                            fieldLabel: 'Notes'
                         }
                       
                    ]
                }
            ]     

});