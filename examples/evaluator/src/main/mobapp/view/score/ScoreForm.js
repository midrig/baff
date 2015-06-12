Ext.define('Evaluator.view.score.ScoreForm', {
    extend: 'Baff.app.view.FormPanel',
    requires: ['Baff.app.view.LabelSliderField'],
    
    alias: 'widget.scoreform',
    
    config: {

            items: [
                          
                {
                xtype: 'fieldset',
                title: 'Score Details',
                
                items: [
                        {    
                            xtype: 'textfield',
                            name: 'criteria.name',
                            label: 'Criteria',
                            disabled: true
                        },
                        {
                           xtype: 'textfield',
                            name: 'option.name',
                            label: 'Option',
                            disabled: true
                         },
                        {
                           xtype: 'labelsliderfield',
                            name: 'score',
                            label: 'Score',
                            labelAlign: 'top',
                            minValue: 0,
                            maxValue: 100
                         },
                        {
                           xtype: 'textareafield',
                            name: 'notes',
                            label: 'Notes'
                         }
                       
                    ]
                }
            ]     
    }

});