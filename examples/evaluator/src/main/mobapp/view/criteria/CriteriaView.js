Ext.define('Evaluator.view.criteria.CriteriaView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.criteriaview',
    
    requires: ['Evaluator.view.criteria.CriteriaForm',
                    'Evaluator.view.criteria.CriteriaList',
                    'Evaluator.controller.activity.CriteriaController'],
    
    config : {

        formPanel: 'criteriaform',
        listPanel: 'criterialist'
        
    },
    
     setupDockedItems: function() {
       var me = this;
       
       var items = me.callParent(arguments);
         
       items.push({  
                        text: 'Abs',
                        iconCls: 'toggle',
                        iconAlign: 'top',
                        itemId: 'toggleRelativeButton',
                        cls: 'baff-button',
                        ui: 'round'
                        });
                        
        return items;
   
     }

});

