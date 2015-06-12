Ext.define('Evaluator.view.score.ScoreView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.scoreview',
    
    requires: ['Evaluator.view.score.ScoreForm',
                    'Evaluator.view.score.ScoreList',
                    'Evaluator.controller.activity.ScoreController'],
    
    config : {
           
        formPanel: 'scoreform',
        listPanel: 'scorelist'
        
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
                        },{  
                        text: 'Act',
                        iconCls: 'toggle',
                        iconAlign: 'top',
                        itemId: 'toggleScoreButton',
                        cls: 'baff-button',
                        ui: 'round'
                        },{  
                        text: 'Mine',
                        iconCls: 'user',
                        iconAlign: 'top',
                        itemId: 'toggleScopeButton',
                        cls: 'baff-button',
                        ui: 'round'
                        });
                        
        return items;
   
     }

    
});

