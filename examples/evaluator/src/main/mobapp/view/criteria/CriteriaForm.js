Ext.define('Evaluator.view.criteria.CriteriaForm', {
    extend: 'Baff.app.view.FormPanel',  
    requires: ['Baff.app.view.LabelSliderField'],
    
    alias: 'widget.criteriaform',
    
    config: {

            items: [
                         
                {
                xtype: 'fieldset',
                title: 'Criteria Details',
                
                items: [
                    
                        {    
                            xtype: 'textfield',
                            name: 'name',
                            label: 'Name'
                        },
                        {
                           xtype: 'labelsliderfield',
                            name: 'weight',
                            label: 'Weight',
                            labelAlign: 'top',
                            minValue: 0,
                            maxValue: 100
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