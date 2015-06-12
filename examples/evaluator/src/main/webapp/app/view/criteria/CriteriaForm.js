Ext.define('Evaluator.view.criteria.CriteriaForm', {
    extend: 'Baff.app.view.FormPanel',  
    requires: ['Ext.slider.Single'],
    
    alias: 'widget.criteriaform',

            items: [
                         
                {
                xtype: 'fieldset',
                title: 'Criteria Details',
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
                           xtype: 'sliderfield',
                            name: 'weight',
                            fieldLabel: 'Weight',
                            minValue: 0,
                            maxValue: 100
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